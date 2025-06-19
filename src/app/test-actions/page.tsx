import { testAction } from "@/lib/actions/test-action";

export default function TestActionsPage() {  async function handleTest() {
    "use server";
    const result = await testAction();
    console.log("Server action result:", result);
    // Form actions should not return values
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Server Actions</h1>
      <form action={handleTest}>
        <button 
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Server Action
        </button>
      </form>
    </div>
  );
}
