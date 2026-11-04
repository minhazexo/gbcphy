// Dropdown menu UI component for the admin dashboard.

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  cloneElement,
  isValidElement,
  Children
} from "react";
import "./Dropdown.scss";

export const Dropdown = ({
  trigger,
  children,
  isOpen: controlledIsOpen,
  defaultOpen = false,
  placement = "bottom",
  align = "start",
  onOpenChange,
  closeOnSelect = true,
  className,
  menuClassName
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : uncontrolledOpen;
  const containerRef = useRef(null);
  const menuIdRef = useRef(
    `admin-dropdown-menu-${Math.random().toString(36).slice(2)}`
  );

  const setOpen = useCallback(
    (next) => {
      if (controlledIsOpen === undefined) {
        setUncontrolledOpen(next);
      }
      if (typeof onOpenChange === "function") {
        onOpenChange(next);
      }
    },
    [controlledIsOpen, setUncontrolledOpen, onOpenChange]
  );

  const toggle = useCallback(() => setOpen(!isOpen), [setOpen, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (isOpen && event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setOpen]);

  const handleSelect = useCallback(() => {
    if (closeOnSelect) {
      setOpen(false);
    }
  }, [setOpen, closeOnSelect]);

  const triggerProps = {
    "aria-haspopup": "menu",
    "aria-expanded": isOpen,
    "aria-controls": menuIdRef.current,
    onClick: (event) => {
      event.stopPropagation();
      if (typeof trigger.props.onClick === "function") {
        trigger.props.onClick(event);
      }
      toggle();
    }
  };

  const triggerElement = isValidElement(trigger)
    ? cloneElement(trigger, triggerProps)
    : trigger;

  return (
    <div className={`dropdown ${className ?? ""}`} ref={containerRef}>
      {triggerElement}
      {isOpen && (
        <div
          id={menuIdRef.current}
          className={`dropdown__menu dropdown__menu--${placement} dropdown__menu--align-${align} ${menuClassName ?? ""}`}
          role="menu"
          aria-orientation="vertical"
        >
          {Children.map(children, (child) =>
            isValidElement(child)
              ? cloneElement(child, {
                  role: "menuitem",
                  onClick: (event) => {
                    if (typeof child.props.onClick === "function") {
                      child.props.onClick(event);
                    }
                    handleSelect();
                  }
                })
              : child
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
