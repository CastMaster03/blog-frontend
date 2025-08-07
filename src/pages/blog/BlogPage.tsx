import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Blog {
  _id: string;
  title: string;
  description: string;
  mediaUrl?: string;
  createdBy: { name: string };
  likes: string[];
  createdAt: string;
}

interface Comment {
  _id: string;
  text: string;
  createdBy: { name: string };
  createdAt: string;
}

const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [commentText, setCommentText] = useState('');
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});

  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  const userId = userData ? JSON.parse(userData)?._id : null;
  const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://blogdemo.divyeshsarvaiya.com';

  const fetchBlogs = async (): Promise<any[]> => {
    try {
      const res = await fetch(`${BASE_URL}/api/blogs`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch blogs');
      return data.data || [];
    } catch {
      toast.error('Error fetching blogs');
      return [];
    }
  };

  const fetchComments = async (blogId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/comments/${blogId}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setCommentsMap(prev => ({ ...prev, [blogId]: data.data }));
      } else {
        toast.error(data.message || 'Failed to load comments');
      }
    } catch (err) {
      toast.error('Error loading comments');
      console.error(err);
    }
  };

  useEffect(() => {
    const loadBlogs = async () => {
      const blogList = await fetchBlogs();
      setBlogs(blogList);
    };

    loadBlogs();
  }, []);

  const getMediaType = (url: string): 'image' | 'video' | 'unknown' => {
    if (!url) return 'unknown';
    const ext = url.split('.').pop()?.toLowerCase();
    if (!ext) return 'unknown';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    return 'unknown';
  };

  const handleLike = async (blogId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/blogs/${blogId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blogList = await fetchBlogs();
        setBlogs(blogList);
        toast.success('Liked!');
      } else {
        toast.error('Failed to like');
      }
    } catch {
      toast.error('Like action failed');
    }
  };

  const handleComment = async () => {
    if (!selectedBlogId || !commentText.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/api/comments/${selectedBlogId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: commentText }),
      });

      if (res.ok) {
        setCommentText('');
        await fetchComments(selectedBlogId);
        toast.success('Comment added!');
      } else {
        toast.error('Failed to add comment');
      }
    } catch {
      toast.error('Comment action failed');
    }
  };

  const toggleCommentSection = async (blogId: string) => {
    if (selectedBlogId === blogId) {
      setSelectedBlogId(null);
    } else {
      setSelectedBlogId(blogId);
      if (!commentsMap[blogId]) {
        await fetchComments(blogId);
      }
    }
  };

  return (
    <div className="container py-4">
      <ToastContainer position="top-center" autoClose={2000} />
      <h2 className="mb-4 text-center">Blogs</h2>

      <div className="row">
        {blogs.map((blog) => {
          const liked = blog?.likes.includes(userId);
          const comments = commentsMap[blog._id] || [];

          return (
            <div key={blog._id} className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">{blog.title}</h5>

                  {blog.mediaUrl && (
                    <div className="mb-3">
                      {getMediaType(blog.mediaUrl) === 'image' && (
                        <img
                          src={`${BASE_URL}/uploads/${blog.mediaUrl}`}
                          alt="blog-media"
                          className="img-fluid rounded"
                          style={{ maxHeight: '300px', objectFit: 'cover' }}
                        />
                      )}
                      {getMediaType(blog.mediaUrl) === 'video' && (
                        <video controls width="100%" style={{ maxHeight: '300px' }}>
                          <source src={`${BASE_URL}/uploads/${blog.mediaUrl}`} type="video/mp4" />
                        </video>
                      )}
                    </div>
                  )}

                  <p className="card-text">{blog.description}</p>
                  <p className="text-muted">By {blog.createdBy.name}</p>
                  <p className="text-muted small">{new Date(blog.createdAt).toLocaleString()}</p>

                  <div className="d-flex gap-3 align-items-center">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleLike(blog._id)}
                    >
                      <FontAwesomeIcon
                        icon={faHeart}
                        style={{ color: liked ? 'red' : 'gray' }}
                      />{' '}
                      {blog.likes.length}
                    </button>

                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() =>
                        navigator.share?.({
                          title: blog.title,
                          text: blog.description,
                        })
                      }
                    >
                      <FontAwesomeIcon icon={faShareAlt} />
                    </button>

                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => toggleCommentSection(blog._id)}
                    >
                      Comment
                    </button>
                  </div>

                  {selectedBlogId === blog._id && (
                    <div className="mt-3">
                      <textarea
                        className="form-control mb-2"
                        placeholder="Write a comment..."
                        rows={2}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      <button className="btn btn-sm btn-success mb-3" onClick={handleComment}>
                        Submit
                      </button>

                      <div className="border-top pt-3">
                        <h6>Comments</h6>
                        {comments.length === 0 ? (
                          <p className="text-muted">No comments yet.</p>
                        ) : (
                          comments.map((c) => (
                            <div key={c._id} className="mb-2">
                              <strong>{c.createdBy?.name || " "}</strong>
                              <small className="text-muted">
                                ({new Date(c.createdAt).toLocaleString()})
                              </small>
                              <p className="mb-1">{c.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlogPage;
