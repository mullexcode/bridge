export default function Input({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (value: string) => void }) {

  return (
    <div className='mb-4'>
      {
        label && <div className='mb-[10px] text-[16px] font-medium text-left leading-[21px] text-[#454464]'>{label}</div>
      }
      <input className='w-full relative h-[56px] placeholder:text-[#A6A8B3] outline-none border-none !shadow-none flex items-center justify-between px-[20px] text-[15px] bg-[#F2F3F8] rounded-[12px]' placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}></input>
    </div>
  )
}
