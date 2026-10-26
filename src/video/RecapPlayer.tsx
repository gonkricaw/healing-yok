import { Player } from "@remotion/player"
import { RECAP, RecapVideo, type RecapProps } from "./RecapVideo"

/** Dimuat lazy dari langkah 3. Tidak autoplay: pengguna yang menekan putar. */
export default function RecapPlayer(props: RecapProps) {
  return (
    <Player
      component={RecapVideo}
      inputProps={props}
      compositionWidth={RECAP.width}
      compositionHeight={RECAP.height}
      durationInFrames={RECAP.durationInFrames}
      fps={RECAP.fps}
      initialFrame={150}
      controls
      loop
      clickToPlay
      acknowledgeRemotionLicense
      style={{ width: "100%", aspectRatio: "9 / 16", borderRadius: 20, overflow: "hidden" }}
    />
  )
}
