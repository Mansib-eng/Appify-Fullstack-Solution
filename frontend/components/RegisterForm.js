"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!termsAgreed) {
      setError("You must agree to the terms & conditions to register.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password and repeat password must match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      router.push("/feed");
      router.refresh();
    } catch (submitError) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="_social_registration_form" onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-6">
          <div className="_social_registration_form_input _mar_b14">
            <label className="_social_registration_label _mar_b8">First Name</label>
            <input
              type="text"
              name="firstName"
              className="form-control _social_registration_input"
              value={form.firstName}
              onChange={updateField}
              required
            />
          </div>
        </div>
        <div className="col-6">
          <div className="_social_registration_form_input _mar_b14">
            <label className="_social_registration_label _mar_b8">Last Name</label>
            <input
              type="text"
              name="lastName"
              className="form-control _social_registration_input"
              value={form.lastName}
              onChange={updateField}
              required
            />
          </div>
        </div>

        <div className="col-12">
          <div className="_social_registration_form_input _mar_b14">
            <label className="_social_registration_label _mar_b8">Email</label>
            <input
              type="email"
              name="email"
              className="form-control _social_registration_input"
              value={form.email}
              onChange={updateField}
              required
            />
          </div>
        </div>

        <div className="col-12">
          <div className="_social_registration_form_input _mar_b14">
            <label className="_social_registration_label _mar_b8">Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control _social_registration_input"
                value={form.password}
                onChange={updateField}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "#666",
                }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="_social_registration_form_input _mar_b14">
            <label className="_social_registration_label _mar_b8">Repeat Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="form-control _social_registration_input"
                value={form.confirmPassword}
                onChange={updateField}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "#666",
                }}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="form-check _social_registration_form_check">
            <input
              className="form-check-input _social_registration_form_check_input"
              type="checkbox"
              id="terms"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              required
            />
            <label className="form-check-label _social_registration_form_check_label" htmlFor="terms">
              I agree to terms & conditions
            </label>
          </div>
        </div>
      </div>

      {error ? (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      ) : null}

      <div className="row">
        <div className="col-12">
          <div className="_social_registration_form_btn _mar_t40 _mar_b60">
            <button type="submit" className="_social_registration_form_btn_link _btn1" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
