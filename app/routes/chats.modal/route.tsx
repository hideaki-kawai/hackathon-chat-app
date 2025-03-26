import { Form, Link, useNavigate, type ActionFunctionArgs } from "react-router";
import { Button } from "shared/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "shared/components/ui/dialog";

export async function clientAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const url = formData.get("url");
  console.log(url);
  return null;
}

export default function UrlModal() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <DialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <DialogHeader>
              <DialogTitle>URL</DialogTitle>
              <DialogDescription>URLを入力してください</DialogDescription>
            </DialogHeader>
            <Form method="post" className="space-y-4 mt-4">
              <div className="space-y-2">
                <input
                  type="text"
                  name="url"
                  placeholder="https://example.com"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="submit">Create</Button>
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </Form>
          </DialogContent>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
