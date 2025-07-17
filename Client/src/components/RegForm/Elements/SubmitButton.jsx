import { ArrowRight } from "lucide-react";


function SubmitButton({ isLoading, step, labels }) {
  return (
    <button
      type="submit"
      className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-lg font-medium transition-colors flex items-center justify-center mt-8 cursor-pointer"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span className="ml-2">Procesando...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <span>{step === 2 ? labels.submit : labels.continue}</span>
          <ArrowRight className="ml-2 h-5 w-5" />
        </div>
      )}
    </button>
  );
}

export default SubmitButton;