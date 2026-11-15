import { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import AddressForm from "../components/AddressForm.jsx";
import "./AddressFormPage.css";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const EMPTY_ADDRESS = {
  street: "",
  unit: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
  startMonth: "",
  endMonth: "",
  current: false,
  landlordName: "",
  landlordPhone: "",
  landlordEmail: "",
  notes: "",
};

const monthOrEmpty = (value) => (MONTH_PATTERN.test(value) ? value : "");

export default function AddressFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [address, setAddress] = useState(() =>
    id
      ? null
      : {
          ...EMPTY_ADDRESS,
          startMonth: monthOrEmpty(searchParams.get("start") ?? ""),
          endMonth: monthOrEmpty(searchParams.get("end") ?? ""),
        },
  );
  const [status, setStatus] = useState(id ? "loading" : "ready");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadAddress = async () => {
      try {
        const res = await fetch(`/api/addresses/${encodeURIComponent(id)}`);
        if (res.status === 401) {
          setStatus("login");
          return;
        }
        if (res.status === 404) {
          setStatus("missing");
          return;
        }
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }
        const data = await res.json();
        setAddress({ ...data.address, endMonth: data.address.endMonth ?? "" });
        setStatus("ready");
      } catch (error) {
        console.error("Failed to load address:", error);
        setStatus("error");
      }
    };

    loadAddress();
  }, [id]);

  const saveAddress = async (newAddress) => {
    try {
      const res = await fetch(id ? `/api/addresses/${encodeURIComponent(id)}` : "/api/addresses", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      if (res.ok) {
        navigate("/addresses");
        return;
      }
      if (res.status === 400) {
        const data = await res.json();
        setErrors(data.errors);
        return;
      }
      if (res.status === 401) {
        setErrors({ form: "Please log in to save this address." });
        return;
      }
      throw new Error(`Status ${res.status}`);
    } catch (error) {
      console.error("Failed to save address:", error);
      setErrors({ form: "The address could not be saved. Try again." });
    }
  };

  return (
    <main className="address-form-page">
      <Link className="address-form-page-back" to="/addresses">
        ← Back to Addresses
      </Link>
      <h1>{id ? "Edit address" : "Add address"}</h1>

      {status === "loading" && <p role="status">Loading address...</p>}
      {status === "login" && (
        <p>
          Please{" "}
          <Link to="/login" reloadDocument>
            log in
          </Link>{" "}
          to add or edit an address.
        </p>
      )}
      {status === "missing" && <p>Address not found.</p>}
      {status === "error" && (
        <Alert variant="danger" className="address-form-page-alert">
          The address could not be loaded. Try again.
        </Alert>
      )}
      {status === "ready" && (
        <div className="address-form-page-card">
          <AddressForm
            initialAddress={address}
            errors={errors}
            submitLabel={id ? "Save changes" : "Save address"}
            onSave={saveAddress}
          />
        </div>
      )}
    </main>
  );
}

AddressFormPage.propTypes = {};
