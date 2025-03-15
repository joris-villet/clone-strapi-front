// app/components/StepperHeader.tsx
interface StepperHeaderProps {
    step: number;
    steps: string[];
  }
  
  export const StepperHeader = ({ step, steps }: StepperHeaderProps) => (
    <div className="mb-8">
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {steps.map((label, index) => (
          <span
            key={label}
            className={`px-4 py-2 rounded-full text-sm font-medium
              ${step >= index 
                ? 'bg-blue-500 text-white' 
                : 'bg-transparent border border-gray-300 text-gray-700'}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );