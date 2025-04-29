"use client";

import { Suspense, useState, useEffect } from "react";
import { getAccountWithTransactions } from "@/actions/account";
import { BarLoader } from "react-spinners";
import { TransactionTable } from "../_components/transaction-table";
import { notFound, useParams } from "next/navigation";
import { AccountChart } from "../_components/account-chart";
import { motion, AnimatePresence } from "framer-motion";

export default function AccountPage() {
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const { id } = params;
  
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAccountWithTransactions(id);
        if (!data) {
          notFound();
        }
        setAccountData(data);
      } catch (error) {
        console.error("Error fetching account data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id]);
  
  if (loading) {
    return <BarLoader color="#10b981" width="100%" />;
  }
  
  if (!accountData) {
    return <div>Account not found</div>;
  }
  
  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent capitalize">
            {account.name}
          </h1>
          <p className="text-gray-500">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ${parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-sm text-gray-500">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <div className="rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-white to-blue-50">
          <AccountChart transactions={transactions} />
        </div>
      </Suspense>

      {/* Transactions Table */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <div className="rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-white to-blue-50">
          <TransactionTable transactions={transactions} />
        </div>
      </Suspense>
    </div>
  );
}