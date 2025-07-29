import Image from 'next/image'
import logoStyles from './Logo.module.css'

export function Logo() {
  return (
    <div className={logoStyles.logo}>
      <Image 
        alt="logo" 
        className={logoStyles.logoImage} 
        src="/AuthPage_logo.svg"
        width={124}
        height={28}
        priority
      />
    </div>
  )
} 