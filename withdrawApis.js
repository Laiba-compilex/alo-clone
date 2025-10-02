import { toast } from "react-toastify";
import getAxiosInstance from "./BaseUrl";

export const APIWithdrawRequest = async (amount, bank_account_id) => {
  const BaseUrl = await getAxiosInstance();
  var formData = new FormData();
  formData.append("transaction_amount", amount * 1000);
  formData.append("bank_id", Number(bank_account_id) || null);
  const token = localStorage.getItem("auth_token");

  try {
    const res = await BaseUrl.post("/account/withdraw", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === 200) {
      toast.success("Withdrawal request created successfully!");
      return res?.data?.data;
    }
  } catch (e) {
    if (e.response.data.message === "INSUFFICIENT_BALANCE") {
      return "INSUFFICIENT_BALANCE";
    } else if (e.response.data.message === "DAILY_LIMIT_EXCEEDED") {
      return "DAILY_LIMIT_EXCEEDED";
    } else if (e.response.data.message === "BANK_ACCOUNT_NOT_VERIFIED") {
      return "BANK_ACCOUNT_NOT_VERIFIED";
    } else if (e.response.data.message === "WITHDRAWAL_NOT_ALLOWED") {
      return "WITHDRAWAL_NOT_ALLOWED";
    } else {
      console.log(e);
      return null;
    }
  }
  return null;
};

export const withdrawAllowed = async () => {
  const BaseUrl = await getAxiosInstance();

  return BaseUrl.get("player/check/allow/withdraw", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
  });
};

export const getBankAccountsApi = async () => {
  const BaseUrl = await getAxiosInstance();

  try {
    const res = await BaseUrl.get(`/account/bank_accounts`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    if (res?.status === 200 && res?.data) {
      return res.data;
    }
  } catch (e) {
    console.log(e);
  }
  return false;
};

export const singleTransactionStatusCheck = async (id) => {
  const BaseUrl = await getAxiosInstance();

  try {
    const res = await BaseUrl.get(`/account/transaction/status/check/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    if (res.status === 200 && res.data) {
      return res.data;
    }
  } catch (e) {
    console.log(e);
  }
  return false;
};
