import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../utils/supabase";


interface Knowledge {
    id: number | null;
    title: string;
    categoryId: number;
    tagIds: number[];
    body: string;
    basis: string | null;
    userId: string | null;
    //expirationDate : 
}

interface KnowledgeModalProps {
    modalRef: React.RefObject<HTMLDialogElement | null>;
    onModalClose: () => void;
    addKnowledge: (
        title: string,
        categoryId: number,
        tagIds: number[],
        body: string,
        basis: string | null
    ) => Promise<boolean>;
}

interface Category {
    id: number;
    name: string;
}

interface Tag {
    id: number;
    name: string;
}

const KnowledgeModal = (props: KnowledgeModalProps) => {
    const addCategoryModal = useRef<HTMLDialogElement>(null);
    const addTagModal = useRef<HTMLDialogElement>(null);

    const initData = {
        title: '',
        category: null as number | null,
        tag: [] as number[],
        body: '',
        basis: '',
    };

    const [form, setForm] = useState(initData);

    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState("");
    const [categoryError, setCategoryError] = useState("");

    const [tagQuery, setTagQuery] = useState("");
    const [tags, setTags] = useState<Tag[]>([]);
    const [newTag, setNewTag] = useState("");
    const [tagError, setTagError] = useState("");

    const [titleError, setTitleError] = useState("");
    const [bodyError, setBodyError] = useState("");

    const handleClose = () => {
        props.onModalClose();
        setForm(initData);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { title, category, tag, body, basis } = form;

        if (title.trim() === "") {
            setTitleError("タイトルを入力してください");
            return;
        }

        if (category === null) {
            setCategoryError("カテゴリを選択してください");
            return;
        }

        if (body.trim() === "") {
            setBodyError("内容を入力してください");
            return;
        }

        const success = await props.addKnowledge(
            title,
            category,
            tag,
            body,
            basis,
        );

        if (success) {
            handleClose();
        }

    };

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("id, name")
                .order("id", { ascending: true });

            if (error) {
                console.error("カテゴリ取得エラー:", error);
                return;
            }

            setCategories(data ?? []);
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchTags = async () => {
            const { data, error } = await supabase
                .from("tags")
                .select("id, name")
                .order("id", { ascending: true });

            if (error) {
                console.error("タグ取得エラー:", error);
                return;
            }

            setTags(data ?? []);
        };

        fetchTags();
    }, []);

    const onAddCategoryModalOpen = () => {
        addCategoryModal.current?.showModal();
    };

    const onAddTagModalOpen = () => {
        addTagModal.current?.showModal();
    };

    return (
        <div>
            <dialog ref={props.modalRef} id="add-knowledge-modal" className="modal">
                <div className="modal-box bg-gray-100 text-gray-800">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-2">
                            <h3 className="font-semibold text-gray-800">
                                タイトル
                                <span className="ml-1 text-sm text-red-500">
                                    （必須）
                                </span>
                            </h3>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => 
                                    setForm((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                    }))
                                }
                                className="input flex w-full border-gray-300 bg-white text-gray-800 placeholder:text-gray-400"
                                placeholder="タイトルを入力" />
                            {titleError && (
                                <p className="text-sm text-red-500">
                                    {titleError}
                                </p>
                            )}
                            <h3 className="font-semibold text-gray-800">
                                カテゴリ
                                <span className="ml-1 text-sm text-red-500">
                                    （必須）
                                </span>
                            </h3>
                            <div className="flex gap-2 w-full">
                                <select
                                    value={form.category ?? ""}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            category: e.target.value === ""
                                                ? null
                                                : Number(e.target.value),
                                        }))
                                    }
                                    className={`select border-gray-300 bg-white
                                         ${form.category === null ? "text-gray-400" : "text-gray-800"}`}
                                >
                                    <option value="" disabled hidden>
                                        カテゴリを選択
                                    </option>

                                    {categories.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => onAddCategoryModalOpen()}
                                    className="btn bg-teal-700 py-2 text-white border-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    <span className="text-sm">新規カテゴリ</span>
                                </button>
                            </div>
                            <h3 className="font-semibold text-gray-800">
                                タグ
                                <span className="ml-1 text-sm text-red-500">
                                    （必須）
                                </span>
                            </h3>
                            <div className="flex gap-2 w-full">
                                <input
                                    value={tagQuery}
                                    onChange={(e) => setTagQuery(e.target.value)}
                                    className="input border-gray-300 bg-white text-gray-800 placeholder:text-gray-400"
                                    placeholder="タグを検索・入力"/>
                                <button
                                    type="button"
                                    onClick={() => onAddTagModalOpen()}
                                    className="btn bg-teal-700 py-2 text-white border-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    <span className="text-sm">新規タグ</span>
                                </button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {form.tag.map((tagId) => {
                                    const tag = tags.find((item) => item.id === tagId);

                                    if (!tag) return null;

                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => {
                                                setForm((prev) => ({
                                                    ...prev,
                                                    tag: prev.tag.filter((id) => id !== tag.id)
                                                }));
                                            }}
                                            className="btn btn-sm border-teal-700 bg-teal-100 text-gray-800">
                                            {tag.name}
                                        </button>
                                    )
                                }


                                )}
                            </div>
                            {tagQuery.trim() !== "" && (
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {tags.filter((tag) =>
                                        tag.name.includes(tagQuery) && !form.tag.includes(tag.id)
                                    ).map((tag) =>
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => {
                                                setForm((prev) => ({
                                                    ...prev,
                                                    tag: [...prev.tag, tag.id],
                                                }));
                                                setTagQuery("");
                                            }}
                                            className="btn btn-sm border-gray-300 bg-white text-gray-800"
                                        >{tag.name}</button>
                                    )}
                                </div>
                            )}
                            <h3 className="font-semibold text-gray-800">
                                内容
                                <span className="ml-1 text-sm text-red-500">
                                    （必須）
                                </span>
                            </h3>
                            <textarea
                                className="textarea field-sizing-content w-full border-gray-300 bg-white
                                text-gray-800 placeholder:text-gray-400 max-h-64 overflow-y-auto"
                                placeholder="詳細"
                                rows={1}
                                value={form.body}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        body: e.target.value,
                                    }))
                                } />
                            {bodyError && (
                                <p className="text-sm text-red-500">
                                    {bodyError}
                                </p>
                            )}
                            <h3 className="font-semibold text-gray-800">
                                参考URL
                            </h3>
                            <input
                                type="url"
                                placeholder="https://example.com"
                                className="input w-full border-gray-300 bg-white
                                text-gray-800 placeholder:text-gray-400"
                                value={form.basis}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        basis: e.target.value,
                                    }))
                                } />
                            <button
                                type="button"
                                onClick={handleClose}
                                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                                ✕
                            </button>
                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="btn">
                                    キャンセル
                                </button>
                                <button
                                    type="submit"
                                    className="btn border-0 bg-teal-700 text-white">
                                    登録
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </dialog >
            <dialog ref={addCategoryModal} id="add-category-modal" className="modal">
                <div className="modal-box bg-gray-100 text-gray-800">
                    <form method="dialog">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="input flex w-full border-gray-300 bg-white text-gray-800">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        onFocus={() => setCategoryError("")}
                                        placeholder="カテゴリ名を入力"
                                        className="placeholder:text-gray-400"
                                    />
                                </label>

                                {categoryError && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {categoryError}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setNewCategory("");
                                    addCategoryModal.current?.close();
                                }}
                                className="btn">
                                キャンセル
                            </button>
                            <button
                                type="button"
                                className="btn bg-teal-700 py-2 text-white border-0"
                                onClick={async () => {
                                    const name = newCategory.trim();

                                    if (name === "") {
                                        setCategoryError("カテゴリ名を入力してください");
                                        return;
                                    }

                                    if (categories.some((item) => item.name === name)) {
                                        setCategoryError("このカテゴリはすでに登録されています");
                                        return;
                                    }

                                    const { data, error } = await supabase
                                        .from("categories")
                                        .insert({ name })
                                        .select("id, name")
                                        .single();

                                    if (error) {
                                        console.error("カテゴリ登録エラー:", error);
                                        setCategoryError("カテゴリの登録に失敗しました");
                                        return;
                                    }

                                    setCategories((prev) => [...prev, data]);
                                    setForm((prev) => ({
                                        ...prev,
                                        category: data.id,
                                    }));

                                    setNewCategory("");
                                    setCategoryError("");
                                    addCategoryModal.current?.close();
                                }}>
                                追加
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
            <dialog ref={addTagModal} id="add-tag-modal" className="modal">
                <div className="modal-box bg-gray-100 text-gray-800">
                    <form method="dialog">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="input flex w-full border-gray-300 bg-white text-gray-800">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onFocus={() => setTagError("")}
                                        placeholder="カテゴリ名を入力"
                                        className="placeholder:text-gray-400"
                                    />
                                </label>

                                {tagError && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {tagError}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setNewTag("");
                                    addTagModal.current?.close();
                                }}
                                className="btn">
                                キャンセル
                            </button>
                            <button
                                type="button"
                                className="btn bg-teal-700 py-2 text-white border-0"
                                onClick={async () => {
                                    const name = newTag.trim();

                                    if (name === "") {
                                        setTagError("タグ名を入力してください");
                                        return;
                                    }

                                    if (tags.some((item) => item.name === name)) {
                                        setTagError("このタグはすでに登録されています");
                                        return;
                                    }

                                    const { data, error } = await supabase
                                        .from("tags")
                                        .insert({ name })
                                        .select("id, name")
                                        .single();

                                    if (error) {
                                        console.error("タグ登録エラー:", error);
                                        setTagError("タグの登録に失敗しました");
                                        return;
                                    }

                                    setTags((prev) => [...prev, data]);
                                    setForm((prev) => ({
                                        ...prev,
                                        tag: [...prev.tag, data.id],
                                    }));

                                    setNewTag("");
                                    setTagError("");
                                    addTagModal.current?.close();
                                }}>
                                追加
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div >
    );
};

export default KnowledgeModal;