import { Form } from "lucide-react"
import { FormSection } from "../sections/form-section"

interface PageProps{
    videoId : string
}

export const VideoView =({videoId}:PageProps)=>{  
    return(
        <div className="px-4 -t-2.5 max-w-screen-lg">
          <FormSection videoId={videoId} />
        </div>
    )
  }