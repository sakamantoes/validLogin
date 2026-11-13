import { useNavigate, useSearchParams } from "react-router-dom";
import PaymentModal from "../../components/PaymentModal.jsx";
import CtexPayment from "../../components/payment/CtexPayment.jsx";
import CtexPaymentStatus from "../../components/payment/CtexPaymentStatus.jsx";
import ManualTransferPayment from "../../components/payment/ManualTransferPayment.jsx";
import SquadPayment from "../../components/payment/SquadPayment.jsx";
import { readPendingCtex } from "../../components/payment/ctexStorage.js";

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

  // if (paymentMethod === "quest") {
  //   return (
  //     <AlatPayment
  //       amount={amount}
  //       onBack={handleBackToMethods}
  //     />
  //   );
  // }

  if (paymentMethod === "ctex") {
    const urlReference =
      searchParams.get("reference") ||
      searchParams.get("ref") ||
      searchParams.get("trxref") ||
      "";
    const isReturning = searchParams.get("returned") === "1" || !!urlReference;

    if (isReturning) {
      const pending = readPendingCtex();

      // The reference saved before redirect is the one our backend stored
      // (payment.paymentReference), so it wins over anything in the URL.
      return (
        <CtexPaymentStatus
          reference={pending?.reference || urlReference}
          amount={amount || pending?.amount || ""}
          onBack={handleBackToMethods}
        />
      );
    }

    return <CtexPayment amount={amount} onBack={handleBackToMethods} />;
  }

  if (paymentMethod === "squad") {
    return <SquadPayment amount={amount} onBack={handleBackToMethods} />;
  }

  if (paymentMethod === "manual-transfer") {
    return (
      <ManualTransferPayment amount={amount} onBack={handleBackToMethods} />
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