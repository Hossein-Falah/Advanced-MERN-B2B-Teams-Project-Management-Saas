import { AudioWaveform } from 'lucide-react'

const Logo = () => {
  return (
    <div className='flex items-center justify-center sm:justify-start'>
      <div className='flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground'>
        <AudioWaveform className='size-4' />
      </div>
    </div>
  )
}

export default Logo
