import "./testSetupDom.js";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import App from "./App.js";

test("renders the app without crashing", () => {
  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
  expect(container.querySelector("h1")).not.toBeNull();
});
