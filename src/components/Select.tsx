import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import clsx from "clsx";
import { ChevronDownIcon } from "lucide-react";
import { useMemo } from "react";

export interface OptionModel {
  id: number | string;
  label: string;
  icon: string;
  symbol?: string;
}

export default function Select({
  label,
  placeholder,
  options,
  value,onChange
}: {
  value: number | string;
  label: string;
  placeholder: string;
  options: OptionModel[];
  onChange: (value: number | string) => void;
}) {
  const selected = useMemo(() => {
    if (value && options.length > 0) {
      return options.find((option) => option.id === value);
    }
    return null
  }, [options, value])
  return (
    <div className="mb-3 md:mb-[14px]">
      {label && (
        <div className="mb-[6px] md:mb-[10px] text-[14px] md:text-[16px] font-medium text-left leading-[18px] md:leading-[21px] text-[#454464]">
          {label}
        </div>
      )}
      <Listbox value={value} onChange={(e) => {
        onChange(e)
      }}>
        <ListboxButton
          className={clsx(
            "w-full relative h-[42px] md:h-[48px] cursor-pointer hover:bg-[#F2F3F8] !shadow-none flex items-center justify-between px-[20px] text-[15px] bg-[#F2F3F8] rounded-[12px]",
            "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
          )}
        >
          {selected ? (
            <div className="flex items-center gap-[12px]">
              <img
                alt=""
                src={selected.icon}
                className="w-[28px] rounded-full h-[28px]"
              ></img>
              <span className="text-[16px] font-semibold text-[#2C2C3F]">
                {selected.label}
              </span>
            </div>
          ) : (
            <span className="text-[#A6A8B3]">{placeholder}</span>
          )}
          <ChevronDownIcon
            className="group pointer-events-none size-4"
            aria-hidden="true"
          />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          transition
          className={clsx(
            "rounded-[12px] mt-[16px] w-[calc(90vw-32px)] md:w-[510px] bg-[#E7E9F2] outline-none border-none text-[16px] font-semibold",
            "transition duration-100 ease-in data-leave:data-closed:opacity-0"
          )}
        >
          {options.map((option) => (
            <ListboxOption
              key={option.id}
              value={option.id}
              className={`bg-white text-[#2C2C3F] text-[16px] font-semibold cursor-pointer hover:bg-[#E7E9F2] flex items-center gap-[12px] py-[15px] px-[26px] ${value.toString() === option.id.toString() ? '!bg-[#E7E9F2]' : ''}`}
            >
              <img
                alt=""
                src={option.icon}
                className="w-[28px] rounded-full h-[28px]"
              ></img>
              <div className="">{option.label}</div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}
