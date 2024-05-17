import { useEffect, useRef, useState } from "react"
import { Room } from "./Room";

export const Home = () => {
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState<string | ''>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localVideo, setLocalVideo] = useState<MediaStreamTrack | null>(null);
  const [localAudio, setLocalAudio] = useState<MediaStreamTrack | null>(null);
  async function playVideoFromCamera() {
    try {
      const constraints = { 'video': true, 'audio': true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0];
      setLocalVideo(videoTrack);
      setLocalAudio(audioTrack);
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error opening video camera.', error);
    }
  }


  useEffect(() => {
    if (videoRef)
      playVideoFromCamera();

  }, [videoRef])

  function handlerClick() {
    setJoined(true);
  }

  if (!joined) {
    return <div className="h-screen flex items-center justify-center bg-slate-300">
      <div className="w-full flex flex-row justify-center items-center ">
        <div className="w-1/2 flex justify-center items-center m-10">
          <video autoPlay className="w-full h-full rounded-lg" ref={videoRef} />
        </div>
        <div className="flex flex-row w-1/2">
          <input className="p-5 mx-6 rounded-lg outline-4 border focus-within:border-purple-500 outline-offset-2 focus-within:outline text-xl font-bold" type="text" onChange={(e) => { setName(e.target.value) }} placeholder="Enter Your Name" />
          <button onClick={handlerClick} className="bg-green-400 w-1/4 p-4 rounded-lg cursor-pointer hover:bg-green-600 text-xl font-bold text-white">Join</button>
        </div>
      </div>
    </div>

  }
  return <Room name={name} localVideo={localVideo} localAudio={localAudio} />
}
