import { useCart } from "../cart.jsx";
import Icon from "./Icon.jsx";

export default function Toast() {
  const { toast, openDrawer, dismissToast } = useCart();
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div className={"toast" + (toast.kind === "info" ? " toast--info" : "")} key={toast.key}>
          <span className="toast__check">
            <Icon name={toast.kind === "info" ? "trash" : "check"} strokeWidth={2.2} />
          </span>
          <p>
            <strong>{toast.title}</strong>
            {(toast.product?.name || toast.text) && <span>{toast.product?.name || toast.text}</span>}
          </p>
          {toast.kind === "added" ? (
            <button type="button" className="toast__action" onClick={openDrawer}>
              View cart
            </button>
          ) : (
            toast.action && (
              <button
                type="button"
                className="toast__action"
                onClick={() => {
                  toast.action.run();
                  dismissToast();
                }}
              >
                {toast.action.label}
              </button>
            )
          )}
          <button type="button" className="toast__close" onClick={dismissToast} aria-label="Dismiss">
            <Icon name="close" />
          </button>
        </div>
      )}
    </div>
  );
}
