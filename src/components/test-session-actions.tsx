// Test file to verify session actions export
import * as sessionActions from "@/lib/actions/sessions-test";

console.log("Available session actions:", Object.keys(sessionActions));
console.log("updateSessionDetails exists:", "updateSessionDetails" in sessionActions);
console.log("updateSessionDetails type:", typeof sessionActions.updateSessionDetails);

export default function TestSessionActions() {
  return <div>Test component</div>;
}
