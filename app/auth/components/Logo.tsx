import logoStyles from './Logo.module.css'

export function Logo() {
  return (
    <div className={logoStyles.logo}>
      <img 
        alt="logo" 
        className={logoStyles.logoImage} 
        src="/markat_logo.svg" 
      />
    </div>
  )
} 