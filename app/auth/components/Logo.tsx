import Image from 'next/image'
import logoStyles from './Logo.module.css'

export function Logo() {
  return (
    <div className={logoStyles.logo}>
      <Image 
        alt="logo" 
        className={logoStyles.logoImage} 
        src="/markat_logo.svg"
        width={120}
        height={40}
        priority
      />
    </div>
  )
} 