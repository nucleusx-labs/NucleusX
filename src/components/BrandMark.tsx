import type { ImgHTMLAttributes } from 'react'
import nucleusLogo from '../assets/nucleusxpng.png'

type BrandMarkProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>

export default function BrandMark({ alt = 'NucleusX', ...props }: BrandMarkProps) {
  return <img src={nucleusLogo} alt={alt} {...props} />
}
