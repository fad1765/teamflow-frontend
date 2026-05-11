import { FaCheck } from "react-icons/fa6";
import { RxCross1 } from "react-icons/rx";
import { MdOutlineErrorOutline } from "react-icons/md";
import { IoWarning } from "react-icons/io5";

import "../styles/toast.css";

const ICONS = {
  success: <FaCheck />,
  error: <RxCross1 />,
  info: <MdOutlineErrorOutline />,
  warning: <IoWarning />,
};

export default function Toast({ open, message, type = "info" }) {
  if (!open) return null;

  return (
    <div className={`toast toast--${type}`}>
      <div className="toast-icon">{ICONS[type]}</div>

      <div className="toast-content">
        <span>{message}</span>
      </div>
    </div>
  );
}