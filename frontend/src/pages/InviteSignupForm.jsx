import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/ApiClient";
import { handleAxiosError } from "../utils/handleAxiosError";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

export default function InviteSignup() {
  const { token } = useParams();


  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const validateInvite = async () => {
      try {
        await apiClient.get(`/api/invite/${token}/members/token/status/`);
        setInviteValid(true);
      } catch {
        setInviteValid(false);
      } finally {
        setChecking(false);
      }
    };
    validateInvite();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await apiClient.post(`/api/invite/${token}/members/signup/`, formData);
      alert("Account created successfully!");
    } catch (err) {
      alert(handleAxiosError(err));
    } finally {
      setLoading(false);
    }
  };

  if (checking)
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">
            Validating invite...
          </p>
        </div>
      </div>
    );

  if (!inviteValid)
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-sm shadow-lg">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Invite Invalid
          </h2>
          <p className="text-slate-600 text-sm">
            This invite link has expired or has already been used. Please
            request a new invitation.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Join Workspace
            </h1>
            <p className="text-slate-600 text-sm">
              You were invited as a{" "}
              <span className="font-semibold text-slate-900">Member</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">
                Username
              </label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                required
                placeholder="Choose your username"
                className={`w-full px-4 py-2.5 border rounded-lg transition-all text-sm bg-white text-gray-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                  errors.username ? "border-red-500" : "border-slate-200"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              {errors.username && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
                placeholder="your@email.com"
                className={`w-full px-4 py-2.5 border rounded-lg transition-all text-sm bg-white text-gray-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                  errors.email ? "border-red-500" : "border-slate-200"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className={`w-full px-4 py-2.5 pr-12 border rounded-lg transition-all text-sm bg-white text-gray-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                    errors.password ? "border-red-500" : "border-slate-200"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all duration-200 mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-xs text-slate-500 text-center mt-6">
            By creating an account, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
