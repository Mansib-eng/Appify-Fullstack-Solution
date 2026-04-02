"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
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
    <form className="_social_login_form" onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-12">
          <div className="_social_login_form_input _mar_b14">
            <label className="_social_login_label _mar_b8">Email</label>
            <input
              type="email"
              name="email"
              className="form-control _social_login_input"
              value={form.email}
              onChange={updateField}
              required
            />
          </div>
        </div>

        <div className="col-12">
          <div className="_social_login_form_input _mar_b14">
            <label className="_social_login_label _mar_b8">Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control _social_login_input"
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
      </div>

      <div className="row">
        <div className="col-lg-6 col-md-6 col-sm-12">
          <div className="form-check _social_login_form_check">
            <input
              className="form-check-input _social_login_form_check_input"
              type="checkbox"
              defaultChecked
              id="rememberMe"
            />
            <label className="form-check-label _social_login_form_check_label" htmlFor="rememberMe">
              Remember me
            </label>
          </div>
        </div>
        {/* <div className="col-lg-6 col-md-6 col-sm-12">
          <div className="_social_login_form_left">
            <p className="_social_login_form_left_para">Forgot password?</p>
          </div>
        </div> */}
      </div>

      {error ? (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      ) : null}

      <div className="row">
        <div className="col-12">
          <div className="_social_login_form_btn _mar_t40 _mar_b60">
            <button type="submit" className="_social_login_form_btn_link _btn1" disabled={loading}>
              {loading ? "Logging in..." : "Login now"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
