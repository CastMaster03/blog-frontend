import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Blog {
  _id: string;
  title: string;
  description: string;
  media?: string;
  createdBy: { name: string };
  likes: any[];
  createdAt: string;
}

const AdminBlogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    media: null as File | null,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://blogdemo.divyeshsarvaiya.com";

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/blogs`);
      const body = await res.json();
      if (res.ok) {
        setBlogs(body.data);
      } else {
        toast.error(body.message || "Failed to fetch blogs");
      }
    } catch (err) {
      toast.error("Server error fetching blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (res.ok) {
        toast.success("Blog deleted");
        setBlogs((prev) => prev.filter((b) => b._id !== id));
      } else {
        toast.error(body.message || "Delete failed");
      }
    } catch {
      toast.error("Server error deleting blog");
    }
  };

  const submitBlog = async () => {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    if (form.media) formData.append("media", form.media);

    const url = editingId ? `${BACKEND_URL}/api/blogs/${editingId}` : `${BACKEND_URL}/api/blogs`;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const body = await res.json();
      if (res.ok) {
        toast.success(editingId ? "Blog updated" : "Blog added");
        setForm({ title: "", description: "", media: null });
        setEditingId(null);
        fetchBlogs();
      } else {
        toast.error(body.message || "Operation failed");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };


  useEffect(() => {
    fetchBlogs();
  }, []);

  const columns: ColDef<Blog>[] = [
    { headerName: "Title", field: "title", flex: 1 },
    { headerName: "Author", valueGetter: (p: any) => p.data.createdBy?.name || "Unknown" },
    { headerName: "Likes", valueGetter: (p: any) => p.data.likes?.length || 0 },
    {
      headerName: "Media",
      cellRenderer: (p: any) =>
        p.data.media ? (
          /\.(mp4|webm|ogg)$/i.test(p.data.media) ? (
            <video width="100" height="60" controls>
              <source src={p.data.media} />
            </video>
          ) : (
            <img src={p.data.media} alt="media" width={80} height={60} />
          )
        ) : (
          "N/A"
        ),
    },
    {
      headerName: "Created At",
      valueFormatter: (p: any) => new Date(p?.data?.createdAt).toLocaleString(),
    },
    {
      headerName: "Actions",
      cellRenderer: (params: any) => {
        const blog = params.data;
        return (
          <div>
            <button
              className="btn btn-sm btn-warning me-2"
              onClick={() => {
                setEditingId(blog._id);
                setForm({ title: blog.title, description: blog.description, media: null });
              }}
            >
              Edit
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(blog._id)}>
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="container py-4">
      <ToastContainer position="top-center" autoClose={2000} />
      <h2>Admin Blog Manager</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitBlog();
        }}
        className="mb-4"
        encType="multipart/form-data"
      >
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div className="mb-2">
          <textarea
            className="form-control"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
        <div className="mb-2">
          <input
            type="file"
            accept="image/*,video/*"
            className="form-control"
            onChange={(e) => setForm({ ...form, media: e.target.files?.[0] || null })}
          />
        </div>
        <button type="submit" className="btn btn-primary me-2">
          {editingId ? "Update Blog" : "Add Blog"}
        </button>
        {editingId && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setEditingId(null);
              setForm({ title: "", description: "", media: null });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="ag-theme-alpine" style={{ height: 500 }}>
          <AgGridReact rowData={blogs} columnDefs={columns} pagination />
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
