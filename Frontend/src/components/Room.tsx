import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client";

const URL = "ws://localhost:8080"

export const Room = ({ name, localVideo, localAudio }: { name: string, localVideo: MediaStreamTrack | null, localAudio: MediaStreamTrack | null }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [lobby, setLobby] = useState(true);
  const [senderPc, setSenderPc] = useState<null | RTCPeerConnection>(null);
  const [receiverPc, setReceiverPc] = useState<null | RTCPeerConnection>(null);
  const [receiverName, setReceiverName] = useState<null | string>(null);
  useEffect(() => {
    if (localVideoRef.current) {
      if (localVideo && localAudio) {
        localVideoRef.current.srcObject = new MediaStream([localVideo, localAudio]);
        localVideoRef.current.play();
      }
    }
  }, [localVideoRef])

  useEffect(() => {
    try {
      const socket = io(URL);
      socket.emit('user-connected', { name: name });
      socket.on('send-offer', async ({ roomId }: { roomId: string }) => {
        setLobby(false);
        const pc = new RTCPeerConnection();
        setSenderPc(pc);


        if (localVideo) {
          pc.addTrack(localVideo)
        }
        if (localAudio) {
          pc.addTrack(localAudio)
        }


        pc.onicecandidate = async (e) => {
          if (e.candidate) {
            socket.emit("add-ice-candidate", {
              candidate: e.candidate,
              type: "sender",
              roomId
            })
          }
        }

        pc.onnegotiationneeded = async () => {
          const sdp = await pc.createOffer();

          await pc.setLocalDescription(sdp);

          socket.emit("offer", {
            sdp,
            roomId
          })

        }

      })

      socket.on("offer", async ({ roomId, sdp }: { roomId: string, sdp: any }) => {
        setLobby(false);
        const pc = new RTCPeerConnection();

        const stream = new MediaStream();
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }

        setReceiverPc(pc);
        pc.setRemoteDescription(sdp);


        pc.ontrack = (e) => {
          const { track, type } = e;
          if (type == 'audio') {
            // @ts-ignore
            remoteVideoRef.current.srcObject.addTrack(track)
          } else {
            // @ts-ignore
            remoteVideoRef.current.srcObject.addTrack(track)
          }
          //@ts-ignore
          remoteVideoRef.current.play();
        }



        pc.onicecandidate = async (e) => {
          if (!e.candidate) return;
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId,
          })
        }

        const answer = await pc.createAnswer();

        //@ts-ignore 
        await pc.setLocalDescription(answer)

        socket.emit("answer", {
          roomId,
          sdp: answer
        })


      });
      socket.on("answer", ({ roomId, sdp, name: rname }: { roomId: string, sdp: any, name: string }) => {
        console.log("rname", rname)
        setReceiverName(rname);
        setSenderPc(pc => {
          pc?.setRemoteDescription(sdp);
          return pc;
        });
      })

      socket.on("lobby", () => {
        setLobby(true);
      })

      socket.on("add-ice-candidate", ({ candidate, type }) => {
        if (type == "sender") {
          setReceiverPc(pc => {
            pc?.addIceCandidate(candidate);
            return pc;
          })
        } else {
          setSenderPc(pc => {
            pc?.addIceCandidate(candidate);
            return pc;
          })
        }
      })
    } catch (error) {
      console.error(error);
    }
  }, [name])

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="flex justify-center items-center w-4/5 mx-auto bg-white shadow-lg rounded-lg">
        <div className="w-1/2 p-4">
          <div className="text-center text-lg font-semibold mb-4">{name}</div>
          <video
            ref={localVideoRef}
            playsInline
            autoPlay
            className="w-full h-full border-2 border-gray-300 rounded-lg"
          />
        </div>
        <div className="w-1/2 p-4">
          {lobby ? (
            <div className="text-center text-xl font-medium text-gray-600">
              Waiting to connect you to someone
            </div>
          ) : (
            <div>
              <div className="text-center text-lg font-semibold mb-4">{receiverName}</div>

              <video
                autoPlay
                playsInline
                className="w-full h-full border-2 border-gray-300 rounded-lg"
                ref={remoteVideoRef}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
