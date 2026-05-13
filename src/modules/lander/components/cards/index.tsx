import { PropsWithChildren } from "react"

export const OrbitCard = ({ children }: PropsWithChildren) => {
  return (
    <div
      className="flex items-center justify-center rounded-2xl bg-[#F6F6F6]"
      style={{
        padding: 8,
        minWidth: 175,
        minHeight: 175,
        aspectRatio: "1 / 1",
      }}
    >
      {children}
    </div>
  )
}

export const SampleCardA = () => (
  <OrbitCard>
    <span className="text-sm font-medium text-black/80">Card A</span>
  </OrbitCard>
)

export const SampleCardB = () => (
  <OrbitCard>
    <span className="text-sm font-medium text-black/80">Card B</span>
  </OrbitCard>
)

export const SampleCardC = () => (
  <OrbitCard>
    <span className="text-sm font-medium text-black/80">Card C</span>
  </OrbitCard>
)

export const SampleCardD = () => (
  <OrbitCard>
    <span className="text-sm font-medium text-black/80">Card D</span>
  </OrbitCard>
)

export const SampleCardE = () => (
  <OrbitCard>
    <span className="text-sm font-medium text-black/80">Card E</span>
  </OrbitCard>
)

export const DEFAULT_ORBIT_CARDS = [
  SampleCardA,
  SampleCardB,
  SampleCardC,
  SampleCardD,
  SampleCardE,
]
