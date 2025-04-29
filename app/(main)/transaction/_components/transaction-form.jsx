"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, ArrowRight, DollarSign, Clock, Tag, FileText, CreditCard, Check, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { cn } from "@/lib/utils";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./recipt-scanner";

// Category icons and colors mapping
const CATEGORY_STYLES = {
  "housing": { color: "#FF6B6B", icon: "🏠" },
  "transportation": { color: "#4ECDC4", icon: "🚗" },
  "groceries": { color: "#FFD166", icon: "🛒" },
  "utilities": { color: "#6A0572", icon: "💡" },
  "entertainment": { color: "#1A936F", icon: "🎬" },
  "food": { color: "#3A86FF", icon: "🍔" },
  "shopping": { color: "#F72585", icon: "🛍️" },
  "healthcare": { color: "#FF9E00", icon: "🏥" },
  "education": { color: "#7209B7", icon: "📚" },
  "travel": { color: "#3A0CA3", icon: "✈️" },
  "salary": { color: "#4361EE", icon: "💼" },
  "freelance": { color: "#4CC9F0", icon: "💻" },
  "investments": { color: "#06D6A0", icon: "📈" },
  "other-income": { color: "#118AB2", icon: "💰" },
};

// Get style for a category (with fallbacks)
const getCategoryStyle = (categoryId) => {
  return CATEGORY_STYLES[categoryId] || { 
    color: "#3B82F6", 
    icon: "📊" 
  };
};

export function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [activeStep, setActiveStep] = useState(1);
  const [formComplete, setFormComplete] = useState(false);
  const [suggestingCategory, setSuggestingCategory] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    getValues,
    reset,
    trigger,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
    mode: "onChange"
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const onSubmit = (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
      toast.success("Receipt scanned successfully");
    }
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully"
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, editMode]);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");
  const amount = watch("amount");
  const category = watch("category");
  const accountId = watch("accountId");

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );
  
  const selectedAccount = accounts.find(acc => acc.id === accountId);
  
  // Check if current step is complete
  const isStepComplete = () => {
    switch(activeStep) {
      case 1:
        return !!type && !!amount && !!accountId;
      case 2:
        return !!category && !!date;
      case 3:
        return true; // Description is optional
      default:
        return false;
    }
  };
  
  // Move to next step if current step is complete
  const handleNextStep = async () => {
    const fieldsToValidate = {
      1: ["type", "amount", "accountId"],
      2: ["category", "date"],
      3: ["description"]
    };
    
    const result = await trigger(fieldsToValidate[activeStep]);
    if (result) {
      if (activeStep < 3) {
        setActiveStep(activeStep + 1);
      } else {
        setFormComplete(true);
        handleSubmit(onSubmit)();
      }
    }
  };

  // Suggest category based on description
  const suggestCategory = async () => {
    const description = getValues("description");
    if (!description || description.length < 3) {
      toast.error("Please enter a longer description for AI suggestion");
      return;
    }

    setSuggestingCategory(true);
    
    try {
      // Simulate AI suggestion (in a real app, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Find a suitable category based on the description
      const words = description.toLowerCase().split(/\s+/);
      
      const categoryMapping = {
        'food': ['food', 'restaurant', 'dinner', 'lunch', 'breakfast', 'meal', 'eat', 'pizza', 'burger', 'cafe'],
        'groceries': ['grocery', 'groceries', 'supermarket', 'market', 'store', 'shopping'],
        'transportation': ['gas', 'fuel', 'car', 'uber', 'lyft', 'taxi', 'bus', 'train', 'transport', 'travel'],
        'entertainment': ['movie', 'cinema', 'theater', 'concert', 'show', 'game', 'netflix', 'spotify', 'subscription'],
        'utilities': ['electric', 'water', 'gas', 'bill', 'utility', 'internet', 'phone', 'mobile'],
        'housing': ['rent', 'mortgage', 'apartment', 'house', 'home', 'property'],
        'healthcare': ['doctor', 'hospital', 'medical', 'medicine', 'pharmacy', 'health', 'dental', 'dentist'],
        'education': ['school', 'college', 'university', 'course', 'class', 'book', 'education', 'tuition'],
        'shopping': ['clothes', 'clothing', 'shoes', 'apparel', 'amazon', 'online', 'mall', 'retail'],
        'travel': ['hotel', 'flight', 'airline', 'vacation', 'trip', 'booking', 'airbnb'],
        'salary': ['salary', 'paycheck', 'wage', 'income', 'payment'],
        'investments': ['dividend', 'interest', 'stock', 'bond', 'investment', 'return'],
        'freelance': ['freelance', 'client', 'project', 'gig', 'contract'],
      };
      
      // Find matching category
      let matchedCategory = null;
      let highestScore = 0;
      
      for (const [categoryId, keywords] of Object.entries(categoryMapping)) {
        const matchingWords = words.filter(word => keywords.some(keyword => word.includes(keyword)));
        const score = matchingWords.length;
        
        if (score > highestScore) {
          highestScore = score;
          matchedCategory = categoryId;
        }
      }
      
      // Default to "other" if no match found
      const suggestedCat = matchedCategory || (type === 'INCOME' ? 'other-income' : 'other');
      
      // Find the category in our list
      const matchedCategoryObj = filteredCategories.find(cat => cat.id === suggestedCat);
      
      if (matchedCategoryObj) {
        setSuggestedCategory(matchedCategoryObj.id);
        toast.success(`Suggested category: ${matchedCategoryObj.name}`);
      } else {
        toast.error("Couldn't find a matching category");
      }
    } catch (error) {
      toast.error("Error suggesting category");
      console.error(error);
    } finally {
      setSuggestingCategory(false);
    }
  };

  // Apply suggested category
  const applyCategory = () => {
    if (suggestedCategory) {
      setValue('category', suggestedCategory);
      setSuggestedCategory(null);
      toast.success("Category applied!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {editMode ? "Edit Transaction" : "Add Transaction"}
        </h1>
        
        {!editMode && (
          <p className="text-gray-500 mt-2">
            Track your finances by adding a new transaction to your account
          </p>
        )}
      </motion.div>
      
      {/* Progress Steps */}
      {!editMode && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-white ${
                    step < activeStep 
                      ? 'bg-green-500' 
                      : step === activeStep 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < activeStep ? <Check className="w-5 h-5" /> : step}
                </div>
                <span className={`text-xs mt-2 ${
                  step <= activeStep ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {step === 1 ? 'Basics' : step === 2 ? 'Details' : 'Finalize'}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full rounded-full"></div>
            <motion.div 
              className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((activeStep - 1) / 2) * 100}%` }}
              transition={{ duration: 0.3 }}
            ></motion.div>
          </div>
        </div>
      )}
      
      <form className="space-y-6">
        {/* Receipt Scanner - Only show in create mode */}
        {!editMode && (
          <div className="mb-8">
            <ReceiptScanner onScanComplete={handleScanComplete} />
          </div>
        )}
        
        {/* Step 1: Basic Info */}
        <motion.div 
          initial={{ opacity: 0, x: activeStep === 1 ? 0 : -20 }}
          animate={{ 
            opacity: activeStep === 1 ? 1 : 0,
            x: activeStep === 1 ? 0 : -20,
            display: activeStep === 1 ? 'block' : 'none'
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  type === 'EXPENSE' 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-500'
                }`}
                onClick={() => setValue('type', 'EXPENSE')}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                    <ArrowRight className="w-6 h-6 text-red-500 transform rotate-45" />
                  </div>
                  <span className="font-medium">Expense</span>
                </div>
              </button>
              
              <button
                type="button"
                className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  type === 'INCOME' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-500'
                }`}
                onClick={() => setValue('type', 'INCOME')}
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <ArrowRight className="w-6 h-6 text-green-500 transform -rotate-135" />
                  </div>
                  <span className="font-medium">Income</span>
                </div>
              </button>
            </div>
            {errors.type && (
              <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-10 text-lg font-medium h-12"
                {...register("amount")}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
            )}
          </div>

          {/* Account */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
            <Select
              onValueChange={(value) => setValue("accountId", value)}
              defaultValue={getValues("accountId")}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: account.color || "#3b82f6" }}
                      ></div>
                      {account.name} (${parseFloat(account.balance).toFixed(2)})
                    </div>
                  </SelectItem>
                ))}
                <CreateAccountDrawer>
                  <Button
                    variant="ghost"
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  >
                    Create Account
                  </Button>
                </CreateAccountDrawer>
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-sm text-red-500 mt-1">{errors.accountId.message}</p>
            )}
          </div>
        </motion.div>
        
        {/* Step 2: Details */}
        <motion.div 
          initial={{ opacity: 0, x: activeStep === 2 ? 0 : 20 }}
          animate={{ 
            opacity: activeStep === 2 ? 1 : 0,
            x: activeStep === 2 ? 0 : 20,
            display: activeStep === 2 ? 'block' : 'none'
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="grid grid-cols-3 gap-3">
              {filteredCategories.map((cat) => {
                const style = getCategoryStyle(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      category === cat.id 
                        ? `border-[${style.color}] bg-opacity-10 bg-[${style.color}]` 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      borderColor: category === cat.id ? style.color : undefined,
                      backgroundColor: category === cat.id ? `${style.color}10` : undefined
                    }}
                    onClick={() => setValue('category', cat.id)}
                  >
                    <div className="text-2xl mb-1">{style.icon}</div>
                    <span className="text-xs font-medium capitalize">{cat.name}</span>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 pl-3 text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => setValue("date", date)}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>
            )}
          </div>
        </motion.div>
        
        {/* Step 3: Description and Recurring */}
        <motion.div 
          initial={{ opacity: 0, x: activeStep === 3 ? 0 : 20 }}
          animate={{ 
            opacity: activeStep === 3 ? 1 : 0,
            x: activeStep === 3 ? 0 : 20,
            display: activeStep === 3 ? 'block' : 'none'
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                placeholder="Enter description" 
                className="pl-10 h-12"
                {...register("description")} 
              />
            </div>
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={suggestCategory}
              disabled={suggestingCategory}
            >
              {suggestingCategory ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Suggest Category
            </Button>
            {suggestedCategory && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Suggested category: {filteredCategories.find(cat => cat.id === suggestedCategory)?.name}</p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={applyCategory}
                >
                  Apply Suggested Category
                </Button>
              </div>
            )}
          </div>

          {/* Recurring Toggle */}
          <div className="flex flex-row items-center justify-between rounded-xl border p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                <label className="text-base font-medium">Recurring Transaction</label>
              </div>
              <div className="text-sm text-gray-500">
                Set up a recurring schedule for this transaction
              </div>
            </div>
            <Switch
              checked={isRecurring}
              onCheckedChange={(checked) => setValue("isRecurring", checked)}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {/* Recurring Interval */}
          {isRecurring && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">Recurring Interval</label>
              <Select
                onValueChange={(value) => setValue("recurringInterval", value)}
                defaultValue={getValues("recurringInterval")}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
              {errors.recurringInterval && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.recurringInterval.message}
                </p>
              )}
            </motion.div>
          )}
          
          {/* Transaction Summary */}
          <div className="mt-6 p-4 rounded-xl bg-gray-50 border">
            <h3 className="font-medium text-gray-700 mb-3">Transaction Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Type:</span>
                <span className={`font-medium ${type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'}`}>
                  {type === 'EXPENSE' ? 'Expense' : 'Income'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium">${amount || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account:</span>
                <span className="font-medium">{selectedAccount?.name || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium capitalize">
                  {category ? filteredCategories.find(c => c.id === category)?.name : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium">{date ? format(date, 'PP') : 'Not selected'}</span>
              </div>
              {isRecurring && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Recurring:</span>
                  <span className="font-medium">{getValues("recurringInterval") || 'Not set'}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Navigation Buttons */}
        <div className="flex flex-col gap-4 pt-4">
          {activeStep < 3 ? (
            <Button
              type="button"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 text-lg"
              onClick={handleNextStep}
              disabled={!isStepComplete()}
            >
              Continue
            </Button>
          ) : (
            <Button 
              type="button"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 text-lg"
              onClick={handleSubmit(onSubmit)}
              disabled={transactionLoading || formComplete}
            >
              {transactionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editMode ? "Updating..." : "Creating..."}
                </>
              ) : editMode ? (
                "Update Transaction"
              ) : (
                "Create Transaction"
              )}
            </Button>
          )}
          
          {activeStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setActiveStep(activeStep - 1)}
            >
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}