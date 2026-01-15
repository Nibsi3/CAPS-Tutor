"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Plus,
    Upload,
    Check,
    Building2,
    Globe,
    Mail,
    Phone
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function GeneralSettings() {
    const [logo, setLogo] = useState<string | null>(null)

    const handleLogoUpload = () => {
        // Mock upload
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e: any) => {
            const file = e.target.files[0]
            if (file) {
                const url = URL.createObjectURL(file)
                setLogo(url)
            }
        }
        input.click()
    }

    return (
        <div className="space-y-12">
            {/* Logo Section */}
            <div className="space-y-6">
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-medium text-white">Default Logo</h3>
                    <p className="text-sm text-neutral-500 max-w-xl">
                        This logo will be displayed on all your invoices and client communications by default.
                    </p>
                </div>

                <div className="flex items-center gap-8">
                    <div
                        onClick={handleLogoUpload}
                        className="w-32 h-32 rounded-2xl border-2 border-dashed border-white/5 bg-black hover:border-white/20 transition-all cursor-pointer flex flex-col items-center justify-center group overflow-hidden"
                    >
                        {logo ? (
                            <img src={logo} alt="Logo" className="w-full h-full object-contain p-4" />
                        ) : (
                            <>
                                <Upload className="h-6 w-6 text-neutral-600 group-hover:text-neutral-400 group-hover:scale-110 transition-all mb-2" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 group-hover:text-neutral-400">Upload</span>
                            </>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button variant="outline" className="h-9 border-white/10 bg-white/5 hover:bg-white/10" onClick={handleLogoUpload}>
                            Replace Logo
                        </Button>
                        <Button variant="ghost" className="h-9 text-neutral-500 hover:text-red-500" onClick={() => setLogo(null)}>
                            Remove
                        </Button>
                    </div>
                </div>
            </div>

            {/* Profile Section */}
            <div className="space-y-8 pt-10 border-t border-white/5">
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-medium text-white">Organization Profile</h3>
                    <p className="text-sm text-neutral-500 max-w-xl">
                        Update your company details used for invoicing and billing.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Company Name</Label>
                        <Input placeholder="My Professional Co." className="bg-black border-white/5 h-11 focus-visible:ring-white/10" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Industry</Label>
                        <Select defaultValue="tech">
                            <SelectTrigger className="bg-black border-white/5 h-11 focus:ring-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#09090b] border-white/10 text-white">
                                <SelectItem value="tech">Technology</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Support Email</Label>
                        <Input placeholder="support@myco.com" className="bg-black border-white/5 h-11 focus-visible:ring-white/10" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-neutral-500">Default Currency</Label>
                        <Select defaultValue="zar">
                            <SelectTrigger className="bg-black border-white/5 h-11 focus:ring-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#09090b] border-white/10 text-white">
                                <SelectItem value="zar">South African Rand (ZAR)</SelectItem>
                                <SelectItem value="usd">US Dollar (USD)</SelectItem>
                                <SelectItem value="eur">Euro (EUR)</SelectItem>
                                <SelectItem value="gbp">British Pound (GBP)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-10 border-t border-white/5">
                <Button className="bg-white text-black hover:bg-neutral-200 h-11 px-8 font-semibold rounded-lg">
                    Save everything
                </Button>
            </div>
        </div>
    )
}
