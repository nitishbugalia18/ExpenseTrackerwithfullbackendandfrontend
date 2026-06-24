const FinancialCard = ({ icon, label, value, additionalContent, borderColor = "" }) => {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 ${borderColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        {icon}
      </div>
      {additionalContent}
    </div>
  );
};

export default FinancialCard;
