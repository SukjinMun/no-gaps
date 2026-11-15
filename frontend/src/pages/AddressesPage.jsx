import { useCallback, useEffect, useRef, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import AddressGapCheck from "../components/AddressGapCheck.jsx";
import AddressTimeline from "../components/AddressTimeline.jsx";
import "./AddressesPage.css";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [check, setCheck] = useState(null);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("loading");
  const [deleteFailed, setDeleteFailed] = useState(false);
  const latestRequest = useRef(0);

  const reloadAddresses = useCallback(async () => {
    // A slow answer to an older filter text must not replace a newer one
    const request = ++latestRequest.current;
    try {
      const res = await fetch(`/api/addresses?q=${encodeURIComponent(query)}`);
      if (res.status === 401) {
        setStatus("login");
        return;
      }
      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }
      const data = await res.json();
      if (request !== latestRequest.current) {
        return;
      }
      setAddresses(data.addresses);
      setCheck(data.check);
      setTotal(data.total);
      setStatus("ready");
    } catch (error) {
      console.error("Failed to load addresses:", error);
      if (request === latestRequest.current) {
        setStatus("error");
      }
    }
  }, [query]);

  useEffect(() => {
    // Waits only while the user types in the filter
    const timeout = setTimeout(reloadAddresses, query === "" ? 0 : 300);
    return () => clearTimeout(timeout);
  }, [reloadAddresses, query]);

  const deleteAddress = async (id) => {
    try {
      const res = await fetch(`/api/addresses/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }
      setDeleteFailed(false);
    } catch (error) {
      console.error("Failed to delete address:", error);
      setDeleteFailed(true);
    }
    await reloadAddresses();
  };

  return (
    <main className="addresses-page">
      <div className="addresses-page-header">
        <div>
          <h1 className="addresses-page-title">Addresses</h1>
          <p className="addresses-page-lead">
            Every address you lived at, with any missing months and overlaps in the last 5 years
            flagged.
          </p>
        </div>
        {status === "ready" && (
          <Button as={Link} className="addresses-page-add" to="/addresses/new">
            + Add address
          </Button>
        )}
      </div>

      {status === "loading" && (
        <p role="status" className="addresses-page-status">
          Loading addresses...
        </p>
      )}

      {status === "login" && (
        <p className="addresses-page-status">
          Please{" "}
          <Link to="/login" reloadDocument>
            log in
          </Link>{" "}
          to see your addresses.
        </p>
      )}

      {status === "error" && (
        <Alert variant="danger" className="addresses-page-alert">
          The addresses could not be loaded. Try again.
        </Alert>
      )}

      {status === "ready" && (
        <>
          <details className="addresses-page-help">
            <summary>How to use this page</summary>
            <ol>
              <li>Add each address you lived at, with its start and end month.</li>
              <li>Check “I live here now” for your current address.</li>
              <li>
                Read the gap check. A yellow row is a period with no address. A red row is a period
                with two addresses.
              </li>
              <li>Use Edit or Delete to fix an address.</li>
            </ol>
          </details>
          {deleteFailed && (
            <Alert variant="danger" className="addresses-page-alert">
              The address could not be deleted. Try again.
            </Alert>
          )}
          <AddressGapCheck check={check} />
          <AddressTimeline
            addresses={addresses}
            check={check}
            total={total}
            query={query}
            setQuery={setQuery}
            onDelete={deleteAddress}
          />
        </>
      )}
    </main>
  );
}

AddressesPage.propTypes = {};
