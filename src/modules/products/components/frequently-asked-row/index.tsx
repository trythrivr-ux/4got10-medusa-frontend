"use client"

import { useState } from "react"
import { Plus, Minus } from "@medusajs/icons"
import { Typography } from "@/components/ui"

export default function FrequentlyAskedRow() {
  const [openItemId, setOpenItemId] = useState<string | null>(null)

  const toggleItem = (id: string) => {
    setOpenItemId((prev) => (prev === id ? null : id))
  }

  const faqItems = [
    {
      id: "item-1",
      title: "What kind of content is inside?",
      content:
        "It features 20+ interviews, underground culture, and creative storytelling",
    },
    {
      id: "item-2",
      title: "When will my order ship?",
      content: "Items ship the day after purchase",
    },
    {
      id: "item-3",
      title: "Is this a limited-edition release?",
      content:
        "Yes — this issue is a limited-edition print run. Once it’s sold out, we won’t reprint the same issue.",
    },
  ]

  return (
    <div className="h-fit relative gap-[10px] flex rounded-[10px] p-[12px] bg-[#ffffff] flex-col justify-end w-full overflow-hidden">
      <Typography
        className="text-black text-[12px] leading-[1.2] pt-[4px] tracking-[4%] opacity-[65%]"
        variant="subtitle1"
      >
        Frequently Asked
      </Typography>
      {faqItems.map((item) => {
        const isOpen = openItemId === item.id

        return (
          <div key={item.id} className="w-full border-b border-[#efefef]">
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="w-full h-fit pt-[15px] px-[0px] pb-[15px] flex items-center justify-between text-left"
            >
              <Typography
                className="text-black text-[11.25px] leading-[1.2] tracking-[4%] opacity-[100%]"
                variant="subtitle1"
              >
                {item.title}
              </Typography>

              <div className="w-[15px] h-[15px] rounded-[4px] border border-[#dbdbdb] flex items-center justify-center flex-shrink-0">
                {isOpen ? (
                  <Minus className="w-[8px] h-[8px] text-[#6F6F6F]" />
                ) : (
                  <Plus className="w-[8px] h-[8px] text-[#6F6F6F]" />
                )}
              </div>
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="pb-[10px]">
                  <Typography
                    className="text-black text-[11.25px] leading-[1.2] tracking-[4%] opacity-[55%]"
                    variant="subtitle1"
                  >
                    {item.content}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
