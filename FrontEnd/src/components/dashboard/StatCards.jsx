import { RiFileListLine, RiShoppingCart2Line, RiArchiveLine } from "react-icons/ri";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import { rupiah } from "../../utils/formatter";

function SpendingTrendLabel({ percentage }) {
  if (percentage === 0) {
    return (
      <p className="mt-3 text-xs font-medium text-[#5A6062]">
        No data from last month
      </p>
    );
  }

  const isDown = percentage < 0;

  return (
    <p className={`mt-3 flex items-center gap-1 text-xs font-medium ${isDown ? "text-[#7E8E21]" : "text-red-500"}`}>
      {isDown ? <FaArrowTrendDown /> : <FaArrowTrendUp />}
      <span>
        {Math.abs(percentage)}% {isDown ? "less" : "more"} than last month
      </span>
    </p>
  );
}

export default function StatCards({ data }) {
  const percentage = data?.budget_progress?.spending_change_percentage ?? 0;

  return (
    <div className="mb-5 flex gap-5">

      <div className="flex flex-1 items-start justify-between rounded-[1.8rem] border border-[#E9E9E9] bg-white px-6 py-5">
        <div>
          <p className="text-sm font-medium text-[#5A6062]">Total Monthly Spending</p>
          <h2 className="mt-2 text-[1.5rem] font-bold leading-none text-[#2D3335]">
            {rupiah(data?.monthly_spending || 0)}
          </h2>
          <SpendingTrendLabel percentage={percentage} />
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7E8E21]">
          <RiFileListLine className="text-xl text-[#B7CA93]" />
        </div>
      </div>

      <div className="flex flex-1 items-start justify-between rounded-[1.8rem] border border-[#E9E9E9] bg-white px-6 py-5">
        <div>
          <p className="text-sm font-medium text-[#5A6062]">Shopping Pending</p>
          <h2 className="mt-2 text-[1.5rem] font-bold leading-none text-[#2D3335]">
            {data?.shopping_pending || 0} Items
          </h2>
          <p className="mt-3 text-xs font-medium text-[#5A6062]">
            Next trip scheduled: Sat
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7E8E21]">
          <RiShoppingCart2Line className="text-xl text-[#B7CA93]" />
        </div>
      </div>

      <div className="flex flex-1 items-start justify-between rounded-[1.8rem] border border-[#E9E9E9] bg-white px-6 py-5">
        <div>
          <p className="text-sm font-medium text-[#5A6062]">Inventory Alerts</p>
          <h2 className="mt-2 text-[1.5rem] font-bold leading-none text-[#2D3335]">
            {data?.inventory_alerts || 0} Low Stock
          </h2>
          <div className="mt-3 inline-flex rounded-md bg-[#FA746F] px-2 py-1">
            <span className="text-[10px] font-bold tracking-wide text-[#6E0A12]">
              ACTION NEEDED
            </span>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7E8E21]">
          <RiArchiveLine className="text-xl text-[#B7CA93]" />
        </div>
      </div>

    </div>
  );
}