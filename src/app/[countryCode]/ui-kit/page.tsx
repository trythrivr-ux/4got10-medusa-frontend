import React from "react"
import { Button } from "@/components/ui/button"
import Typography from "@/components/ui/typography"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function UIKit() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Typography variant="title" className="mb-8">
          4Got10 UI Kit
        </Typography>

        {/* Typography Section */}
        <section className="mb-12">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              <strong>&lt;Typography Usage&gt;</strong>
              <br />
              Import:{" "}
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                import Typography from "@/components/ui/typography"
              </code>
              <br />
              Usage:{" "}
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                &lt;Typography
                variant="title|subtitle1|subtitle2|body"&gt;Text&lt;/Typography&gt;
              </code>
              <br />
              Variants: title (20px, uppercase, Neue Haas), subtitle1 (10.8px,
              Inklination), subtitle2 (10.5px, uppercase, Inklination), body
              (9.5px, Inklination)
            </p>
          </div>
          <Typography variant="title" className="mb-6">
            Typography
          </Typography>
          <Card>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Typography variant="title">Heading 1</Typography>
                  <Typography variant="body" className="text-gray-600">
                    text-3xl font-bold
                  </Typography>
                </div>
                <div>
                  <Typography variant="title" className="text-3xl">
                    Heading 1
                  </Typography>
                  <Typography variant="body" className="text-gray-600">
                    text-2xl font-semibold
                  </Typography>
                </div>
                <div>
                  <Typography variant="title" className="text-2xl">
                    Heading 2
                  </Typography>
                  <Typography variant="body" className="text-gray-600">
                    text-2xl font-semibold
                  </Typography>
                </div>
                <div>
                  <Typography variant="title" className="text-xl">
                    Heading 3
                  </Typography>
                  <Typography variant="body" className="text-gray-600">
                    text-xl font-medium
                  </Typography>
                </div>
                <div>
                  <Typography variant="body" className="text-base">
                    Body text - Regular
                  </Typography>
                  <Typography variant="body" className="text-gray-600">
                    text-base
                  </Typography>
                </div>
                <div>
                  <Typography variant="body" className="text-2xl font-semibold">
                    Body text - Bold
                  </Typography>
                  <Typography variant="body" className="text-gray-600">
                    text-sm
                  </Typography>
                </div>
                <div>
                  <Typography variant="body" className="text-sm">
                    Small text - Regular
                  </Typography>
                  <Typography variant="body" className="text-gray-600">
                    text-sm
                  </Typography>
                </div>
                <div>
                  <Typography variant="body" className="text-xs">
                    Extra small text
                  </Typography>
                  <Typography variant="body" className="text-gray-600">
                    text-xs
                  </Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" className="text-[12.5px]">
                    Custom 12.5px with tracking
                  </Typography>
                  <Typography variant="body" className="text-gray-600">
                    text-[12.5px] tracking-[0.01em]
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons Section */}
        <section className="mb-12">
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 text-sm">
              <strong>&lt;Button Usage&gt;</strong>
              <br />
              Import:{" "}
              <code className="bg-green-100 px-2 py-1 rounded text-xs">
                import Button from "@/components/ui/button"
              </code>
              <br />
              Usage:{" "}
              <code className="bg-green-100 px-2 py-1 rounded text-xs">
                &lt;Button variant="backdrop|background|border"
                size="xsmall|small|large"&gt;Text&lt;/Button&gt;
              </code>
              <br />
              Variants: backdrop (blur), background (gray), border (outline)
              <br />
              Sizes: xsmall (22px), small (28px), large (42px, rounded corners)
            </p>
          </div>
          <Typography variant="title" className="mb-6">
            Buttons
          </Typography>
          <Card>
            <CardContent>
              <div className="space-y-6">
                {/* Primary Buttons */}
                <div>
                  <Typography variant="body" className="mb-3">
                    Primary Buttons
                  </Typography>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="backdrop" size="large">
                      Large Button
                    </Button>
                    <Button variant="backdrop" size="small">
                      Small Button
                    </Button>
                    <Button variant="backdrop" size="xsmall">
                      XSmall Button
                    </Button>
                  </div>
                </div>

                {/* Background Buttons */}
                <div>
                  <Typography variant="body" className="mb-3">
                    Background Buttons
                  </Typography>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="background" size="large">
                      Large Background
                    </Button>
                    <Button variant="background" size="small">
                      Small Background
                    </Button>
                    <Button variant="background" size="xsmall">
                      XSmall Background
                    </Button>
                  </div>
                </div>

                {/* Border Buttons */}
                <div>
                  <Typography variant="body" className="mb-3">
                    Border Buttons
                  </Typography>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="border" size="large">
                      Large Border
                    </Button>
                    <Button variant="border" size="small">
                      Small Border
                    </Button>
                    <Button variant="border" size="xsmall">
                      XSmall Border
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form Elements */}
        <section className="mb-12">
          <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-purple-800 text-sm">
              <strong>&lt;Input Usage&gt;</strong>
              <br />
              Import:{" "}
              <code className="bg-purple-100 px-2 py-1 rounded text-xs">
                import Input from "@/components/ui/input"
              </code>
              <br />
              Usage:{" "}
              <code className="bg-purple-100 px-2 py-1 rounded text-xs">
                &lt;Input type="text|email|search" variant="default|search|menu"
                placeholder="..." /&gt;
              </code>
              <br />
              Variants: default (bordered), search (full width), menu (menu
              style)
            </p>
          </div>
          <Typography variant="title" className="mb-6">
            Form Elements
          </Typography>
          <Card>
            <CardContent>
              <div className="space-y-6">
                {/* Inputs */}
                <div>
                  <Typography variant="body" className="mb-3">
                    Inputs
                  </Typography>
                  <div className="space-y-4 max-w-md">
                    <Input type="text" placeholder="Text input" />
                    <Input type="email" placeholder="Email input" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      variant="search"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards & Containers */}
        <section className="mb-12">
          <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-orange-800 text-sm">
              <strong>&lt;Card Usage&gt;</strong>
              <br />
              Import:{" "}
              <code className="bg-orange-100 px-2 py-1 rounded text-xs">
                import Card, CardHeader, CardContent from "@/components/ui/card"
              </code>
              <br />
              Usage:{" "}
              <code className="bg-orange-100 px-2 py-1 rounded text-xs">
                &lt;Card
                variant="default|product|menu"&gt;&lt;CardContent&gt;Content&lt;/CardContent&gt;&lt;/Card&gt;
              </code>
              <br />
              Variants: default (white), product (product card), menu (blur
              background)
            </p>
          </div>
          <Typography variant="title" className="mb-6">
            Cards & Containers
          </Typography>
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Product Card */}
                <Card variant="product">
                  <div className="h-32 bg-gray-200 rounded-[8px] mb-4"></div>
                  <Typography variant="body" className="mb-2">
                    Product Card
                  </Typography>
                  <Typography variant="body" className="text-gray-600">
                    Basic product card layout
                  </Typography>
                </Card>

                {/* Menu Container */}
                <Card variant="menu">
                  <Typography variant="body" className="mb-2">
                    Menu Container
                  </Typography>
                  <Typography variant="subtitle2">
                    With backdrop blur effect
                  </Typography>
                </Card>

                {/* Countdown Pill */}
                <div className="bg-[#F8F8F8]/55 backdrop-blur-[12px] rounded-full h-[27px] px-[19px] flex items-center justify-center w-fit">
                  <Typography variant="subtitle2" className="text-[12.5px]">
                    Custom 12.5px with tracking
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Colors</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="w-full h-20 bg-black rounded-[8px] mb-2"></div>
                <p className="text-sm">Black</p>
                <p className="text-xs text-gray-600">#000000</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-white border border-gray-300 rounded-[8px] mb-2"></div>
                <p className="text-sm">White</p>
                <p className="text-xs text-gray-600">#FFFFFF</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-[#F8F8F8] rounded-[8px] mb-2"></div>
                <p className="text-sm">Light Gray</p>
                <p className="text-xs text-gray-600">#F8F8F8</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-[#efefef] rounded-[8px] mb-2"></div>
                <p className="text-sm">Gray</p>
                <p className="text-xs text-gray-600">#EFEFEF</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-[#f3f3f3] rounded-[8px] mb-2"></div>
                <p className="text-sm">Pill Gray</p>
                <p className="text-xs text-gray-600">#F3F3F3</p>
              </div>
            </div>
          </div>
        </section>

        {/* Effects */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Effects</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Backdrop Blur</h3>
                <div className="bg-[#F8F8F8]/55 backdrop-blur-[12px] rounded-[12px] p-4">
                  <p>Container with backdrop blur effect</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">Shadows</h3>
                <div className="space-y-2">
                  <div className="bg-white p-4 rounded-[10px] shadow-sm">
                    Small shadow
                  </div>
                  <div className="bg-white p-4 rounded-[10px] shadow-md">
                    Medium shadow
                  </div>
                  <div className="bg-white p-4 rounded-[10px] shadow-lg">
                    Large shadow
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
