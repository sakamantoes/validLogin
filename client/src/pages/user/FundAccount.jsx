import { useNavigate, useSearchParams } from "react-router-dom";
import PaymentModal from "../../components/PaymentModal.jsx";
import AlatPayment from "../../components/payment/AlatPayment.jsx"
import ManualTransferPayment from "../../components/payment/ManualTransferPayment.jsx";
import SquadPayment from "../../components/payment/SquadPayment.jsx";

export default function FundAccount() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();  
  const paymentMethod = searchParams.get("paymentMethod");
  const amount = searchParams.get("amount") || "";

  const handleBack = () => {
    navigate("/f/dashboard");
  };

  const handlePaymentMethodSelect = ({ amount, paymentMethod }) => {
    setSearchParams({
      amount: String(amount),
      paymentMethod,
    });
  };

  const handleBackToMethods = () => {
    setSearchParams(amount ? { amount } : {});
  };



  if (paymentMethod === "quest") {
    return (
      <AlatPayment
        amount={amount}
        onBack={handleBackToMethods}
      />
    );
  }

  if (paymentMethod === "squad") {
    return (
      <SquadPayment
        amount={amount}
        onBack={handleBackToMethods}
      />
    );
  }

  if (paymentMethod === "manual-transfer") {
    return (
      <ManualTransferPayment
        amount={amount}
        onBack={handleBackToMethods}
      />
    );
  }

  return (
    <PaymentModal
      isOpen
      initialAmount={amount}
      showBackButton
      onClose={handleBack}
      onSelectPaymentMethod={handlePaymentMethodSelect}
    />
  );
}
