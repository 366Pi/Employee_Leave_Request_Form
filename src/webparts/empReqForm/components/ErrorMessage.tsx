import { MessageBar, MessageBarType } from "@fluentui/react";
import * as React from "react";

interface IExampleProps {
  resetChoice?: () => void;
}

const ErrorMessage = (p: IExampleProps) => {
  return (
    <MessageBar
      messageBarType={MessageBarType.error}
      isMultiline={false}
      onDismiss={p.resetChoice}
      dismissButtonAriaLabel="Close"
    >
      Fill all the fields before submission.
    </MessageBar>
  );
};
export default ErrorMessage;
