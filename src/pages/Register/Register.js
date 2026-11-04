// src/pages/Register/Register.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../../data/supabase.js";
import "../../styles/register.scss";

const DEPARTMENTS = ["Physics", "Chemistry", "Mathematics", "Botany", "Zoology"];
const SESSIONS = ["17-18", "18-19", "19-20", "20-21", "21-22", "22-23", "23-24", "24-25", "25-26"];
const BATCHES = ["2022", "2023", "2024", "2025", "2026"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", studentId: "", registrationNumber: "", department: DEPARTMENTS[0],
    academicSession: SESSIONS[0], batch: BATCHES[0], email: "", phone: "",
    password: "", confirmPassword: "", profilePicture: null
  });
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    const { fullName, studentId, registrationNumber, email, phone, password, confirmPassword } = form;
    if (!fullName.trim()) next.fullName = "Full name is required.";
    if (!studentId.trim()) next.studentId = "Student ID is required.";
    if (!registrationNumber.trim()) next.registrationNumber = "Registration number is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_REGEX.test(email)) next.email = "Enter a valid email address.";
    if (!phone.trim()) next.phone = "Phone number is required.";
    else if (!PHONE_REGEX.test(phone)) next.phone = "Enter a valid phone number.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 6) next.password = "Password must be at least 6 characters.";
    if (!confirmPassword) next.confirmPassword = "Please confirm your password.";
    else if (confirmPassword !== password) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, profilePicture: "Please select an image file." }));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors(prev => ({ ...prev, profilePicture: "Image must be smaller than 5 MB." }));
      return;
    }
    setForm(prev => ({ ...prev, profilePicture: file }));
    setPreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, profilePicture: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setLoading(true);
    setMessage("");

    const { fullName, studentId, registrationNumber, department, academicSession, batch, email, phone, password, profilePicture } = form;

    try {
      if (isSupabaseConfigured) {
        const { data: existing, error: lookupError } = await supabase
          .from("students")
          .select("student_id, registration_number")
          .or(`student_id.eq.${studentId},registration_number.eq.${registrationNumber}`);
        if (lookupError) throw lookupError;
        if (existing && existing.length) {
          const match = existing.find(r => r.student_id === studentId || r.registration_number === registrationNumber);
          setMessage(match.student_id === studentId ? "A student with this ID already exists." : "A student with this registration number already exists.");
          setMessageType("error");
          setSubmitting(false);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            student_id: studentId.trim(),
            registration_number: registrationNumber.trim(),
            department,
            academic_session: academicSession,
            batch,
            phone: phone.trim(),
            profile_image: null,
            role: "student",
            status: "pending"
          }
        }
      });
      if (error) throw error;

      const user = data.user;
      if (isSupabaseConfigured && user) {
        // profiles table only has (id, full_name, email, role, avatar_url, phone)
        await supabase.from("profiles").insert({
          id: user.id,
          full_name: fullName.trim(),
          email,
          role: "student",
          avatar_url: null,
          phone: phone.trim()
        });
        // student-specific fields live in the students table only
        // resolve department_id from the departments table before inserting
        let departmentId = null;
        if (isSupabaseConfigured) {
          const { data: deptData, error: deptError } = await supabase
            .from("departments")
            .select("id")
            .eq("name", department)
            .maybeSingle();
          if (deptError) throw deptError;
          departmentId = deptData?.id ?? null;
        }
        await supabase.from("students").insert({
          id: user.id,
          student_id: studentId.trim(),
          registration_number: registrationNumber.trim(),
          batch,
          academic_session: academicSession,
          department_id: departmentId,
          status: "pending"
        });
      }

      if (isSupabaseConfigured && user && profilePicture) {
        const fileName = `${user.id}/${Date.now()}-${profilePicture.name.replace(/\s+/g, "_")}`;
        const { error: uploadError } = await supabase.storage.from("profile-images").upload(fileName, profilePicture);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("profile-images").getPublicUrl(fileName);
          await supabase.auth.updateUser({ data: { profile_image: urlData.publicUrl } });
          await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", user.id);
        }
      }

      if (data.session) {
        setMessage("Account created successfully.");
        setMessageType("success");
        setTimeout(() => navigate("/profile"), 1500);
      } else {
        setMessage("Account created. Check your email to confirm it, then sign in.");
        setMessageType("info");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setMessage(err.message || "Registration failed. Please try again.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h1>Student Registration</h1>

        {message && <p className={`register-footer ${messageType}`}>{message}</p>}

        <div className="form-group">
          <label>Full Name</label>
          <input
            className={`input-field ${errors.fullName ? "error" : ""}`}
            type="text"
            placeholder="Enter full name"
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            required
          />
          {errors.fullName && <span className="field-error">{errors.fullName}</span>}
        </div>

        <div className="form-group">
          <label>Student ID / Roll Number</label>
          <input
            className={`input-field ${errors.studentId ? "error" : ""}`}
            type="text"
            placeholder="e.g. BCS22-001"
            value={form.studentId}
            onChange={(e) => handleChange("studentId", e.target.value)}
            required
          />
          {errors.studentId && <span className="field-error">{errors.studentId}</span>}
        </div>

        <div className="form-group">
          <label>Registration Number</label>
          <input
            className={`input-field ${errors.registrationNumber ? "error" : ""}`}
            type="text"
            placeholder="e.g. REG-2024-001"
            value={form.registrationNumber}
            onChange={(e) => handleChange("registrationNumber", e.target.value)}
            required
          />
          {errors.registrationNumber && <span className="field-error">{errors.registrationNumber}</span>}
        </div>

        <div className="form-group">
          <label>Department</label>
          <select
            className="input-field"
            value={form.department}
            onChange={(e) => handleChange("department", e.target.value)}
            required
          >
            {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Academic Session</label>
          <select
            className="input-field"
            value={form.academicSession}
            onChange={(e) => handleChange("academicSession", e.target.value)}
            required
          >
            {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Batch</label>
          <select
            className="input-field"
            value={form.batch}
            onChange={(e) => handleChange("batch", e.target.value)}
            required
          >
            {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            className={`input-field ${errors.email ? "error" : ""}`}
            type="email"
            placeholder="Enter email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            className={`input-field ${errors.phone ? "error" : ""}`}
            type="tel"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            className={`input-field ${errors.password ? "error" : ""}`}
            type="password"
            placeholder="Create password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            required
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            className={`input-field ${errors.confirmPassword ? "error" : ""}`}
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            required
          />
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
        </div>

        <div className="form-group">
          <label>Profile Picture (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
          {errors.profilePicture && <span className="field-error">{errors.profilePicture}</span>}
          {preview && <img src={preview} alt="Preview" className="image-preview" />}
        </div>

        <button className="register-button" type="submit" disabled={submitting || loading}>
          {submitting || loading ? "Creating account..." : "Register"}
        </button>

        <p className="register-footer-link">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </form>
    </div>
  );
}

