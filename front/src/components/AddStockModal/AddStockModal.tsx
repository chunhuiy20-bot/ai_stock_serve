interface AddStockModalProps {
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function AddStockModal({ value, onChange, onConfirm, onClose }: AddStockModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div className="bg-[#1c2127] border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl relative z-10 p-6">
        <h3 className="text-xl font-bold mb-6">添加自选股票</h3>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
          placeholder="例如: AAPL"
          className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 mb-6 outline-none uppercase font-mono text-white placeholder:normal-case placeholder:text-gray-600 focus:border-blue-500 transition"
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition">
            取消
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition">
            确认添加
          </button>
        </div>
      </div>
    </div>
  );
}
