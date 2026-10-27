import { GoogleLogin } from "@react-oauth/google";
import { googleAuthVercel } from "../service/auth.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";
import { Loader } from "lucide-react";

export default function GoogleButton() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const successfull = async (credentialResponse) => {
    setIsLoading(true);
    localStorage.removeItem("smswinner_token");
    try {
      const token = credentialResponse.credential;

      const response = await googleAuthVercel(token);

      if (response.status === 200 || response.status === 201 || response.data) {
        const authToken = response.data?.data?.token || response.data.token;

        if (authToken) {
          localStorage.setItem("smswinner_token", authToken);
        }

        navigate("/f/dashboard");
        toast.success("Login successful");
      } else {
        toast.error(response.data.message || "Google login failed");
      }
    } catch (err) {
      console.error("google login: ", err);
      toast.error(err.message || "Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader className="w-7 h-7 text-brand-text animate-spin" />
      ) : (
        <GoogleLogin
          onSuccess={(credentialResponse) => successfull(credentialResponse)}
          onError={() => {
            console.log("Login Failed");
            toast.error("login failed");
          }}
        />
      )}
    </>
  );
}