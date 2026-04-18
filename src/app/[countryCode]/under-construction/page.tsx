import FourGotTenMenu from "@modules/layout/components/4got10-menu"

export default function UnderConstructionPage() {
  return (
    <div className="min-h-screen bg-white p-[10px]">
      <div className="min-h-[calc(100vh-20px)] border border-black bg-[#FFFFFF]">
        <FourGotTenMenu />

        <div className="px-[10px] pb-[10px]">
          <div className="mt-[10px] h-[calc(100vh-170px)] rounded-[6px] border border-black/10 bg-[#F1F1F1]" />
        </div>
      </div>
    </div>
  )
}
