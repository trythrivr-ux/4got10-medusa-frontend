"use client"

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react"

interface NavWrapperProps {
  children: React.ReactNode
}

type NavScrollContextType = {
  isScrolled: boolean
  scrollToTop: () => void
}

export const NavScrollContext = createContext<NavScrollContextType>({
  isScrolled: false,
  scrollToTop: () => {},
})

export const useNavScroll = () => useContext(NavScrollContext)

const NavWrapper = ({ children }: NavWrapperProps) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <NavScrollContext.Provider value={{ isScrolled, scrollToTop }}>
      <div className="relative w-full z-[100]">{children}</div>
    </NavScrollContext.Provider>
  )
}

export default NavWrapper
