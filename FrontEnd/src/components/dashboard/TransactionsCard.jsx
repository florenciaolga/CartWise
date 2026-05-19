import TransactionRow from "../ui/TransactionRow";
import { formatDate } from "../../utils/date";
import { useNavigate } from "react-router-dom";


export default function TransactionsCard({ transactions }) {
  const navigate = useNavigate()
  return (
    <div className="col-span-2 rounded-3xl bg-white p-7 shadow-sm border border-gray-100">
      <p className="text-[1.3rem] mb-5 font-semibold text-[#2D3335]">
        Recent Transactions
      </p>

      <div className="flex flex-col gap-1">
        {transactions?.length > 0 ? (
          transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              name={tx.item_name}
              date={formatDate(tx.transaction_date)}
              category={tx.category_name}
              amount={-tx.total_price}
              img={`https://placehold.co/44x44/e8f5e9/4a541f?text=${tx.item_name.charAt(0)}&font=raleway`}
            />
          ))
        ) : (
          <p className="text-sm text-[#5A6062]">No recent transactions.</p>
        )}
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4 text-center">
        <button onClick={() => navigate("/reports")} className="text-sm font-bold text-[#7E8E21] hover:underline transition">
          View Reports
        </button>
      </div>
    </div>
  );
}