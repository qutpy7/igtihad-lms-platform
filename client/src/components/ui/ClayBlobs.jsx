import React from 'react'

export default function ClayBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div
        className="absolute h-[60vh] w-[60vh] rounded-full bg-[#8B5CF6]/10 blur-3xl animate-clay-float"
        style={{ top: '-10%', right: '-10%' }}
      />
      <div
        className="absolute h-[50vh] w-[50vh] rounded-full bg-[#EC4899]/10 blur-3xl animate-clay-float-delayed animation-delay-2000"
        style={{ bottom: '-5%', left: '-10%' }}
      />
      <div
        className="absolute h-[45vh] w-[45vh] rounded-full bg-[#0EA5E9]/10 blur-3xl animate-clay-float-slow animation-delay-4000"
        style={{ top: '30%', left: '40%' }}
      />
      <div
        className="absolute h-[35vh] w-[35vh] rounded-full bg-[#10B981]/10 blur-3xl animate-clay-float-delayed animation-delay-6000"
        style={{ top: '10%', left: '5%' }}
      />
    </div>
  )
}
