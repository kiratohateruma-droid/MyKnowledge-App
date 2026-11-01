import KnowledgeModal from "./KnowledgeModal";
import SearchInput from "./SearchInput";
import SelectTags from "./SelectTags";
import SelectCategory from "./SelectCategory";
import KnowledgeCard from "./KnowledgeCard";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../utils/supabase";

interface Knowledge {
    id: number;
    title: string;
    categoryId: number;
    categoryName: string;
    tagIds: number[];
    body: string;
    basis: string | null;
}

interface Tag {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

const Body = () => {
    const addKnowledgeModal = useRef<HTMLDialogElement>(null);
    const [knowledges, setKnowledges] = useState<Knowledge[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState("");

    const [searchInputQuery, setSearchInputQuery] = useState("");
    const [searchInputTagQuery, setSearchInputTagQuery] = useState("");

    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const [editingKnowledge, setEditingKnowledge] = useState<Knowledge | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const onModalOpen = () => {
        setEditingKnowledge(null);
        addKnowledgeModal.current?.showModal();
    };

    const onEditModalOpen = (knowledge: Knowledge) => {
        setEditingKnowledge(knowledge);
        addKnowledgeModal.current?.showModal();
    }

    const onModalClose = () => {
        addKnowledgeModal.current?.close();
        setEditingKnowledge(null);
    };

    const fetchKnowledges = async () => {

        const { data: categoryData, error: categoryError } = await supabase
            .from("categories")
            .select(`
            id,
            name
        `);

        if (categoryError) {
            setError("カテゴリ一覧の取得に失敗しました");
            console.error("カテゴリ一覧の取得エラー:", categoryError.message);
            console.error("エラーコード:", categoryError.code);
            console.error("詳細:", categoryError.details);
            console.error("ヒント:", categoryError.hint);
            return;
        }

        setCategories(categoryData ?? [])

        const categoryMap = new Map(
            categoryData.map((category) => [category.id, category.name])
        );

        const { data, error: fetchError } = await supabase
            .from("knowledge_items")
            .select(`
                id,
                title,
                category_id,
                body,
                basis,
                knowledge_tags (
                    tag_id
                )
            `)
            .order("created_at", { ascending: false });

        if (fetchError) {
            setError("知識一覧の取得に失敗しました");
            console.error("知識一覧の取得エラー:", fetchError.message);
            console.error("エラーコード:", fetchError.code);
            console.error("詳細:", fetchError.details);
            console.error("ヒント:", fetchError.hint);
            return;
        }

        const fetchedData: Knowledge[] = data.map((item) => ({
            id: item.id,
            title: item.title,
            categoryId: item.category_id,
            categoryName: categoryMap.get(item.category_id),
            tagIds: item.knowledge_tags.map((item) => item.tag_id),
            body: item.body,
            basis: item.basis,
        }));

        console.log("Supabaseから取得したタグ情報：", data[0]?.knowledge_tags);

        console.log(
            "取得したカテゴリ名：",
            fetchedData.map((item) => item.categoryName)
        );

        setKnowledges(fetchedData);
        setError("");
    };

    useEffect(() => {
        fetchKnowledges();
    }, []);

    const addKnowledge = async (
        title: string,
        categoryId: number,
        tagIds: number[],
        body: string,
        basis: string | null,
    ): Promise<boolean> => {

        const { data, error: insertError } = await supabase
            .from("knowledge_items")
            .insert({
                title,
                category_id: categoryId,
                body,
                basis: basis || null,
            })
            .select("id")
            .single();

        if (insertError) {
            setError("知識の登録に失敗しました");
            console.error(insertError);
            return false;
        }

        if (tagIds.length > 0) {
            const tagData = tagIds.map((tagId) => ({
                knowledge_id: data.id,
                tag_id: tagId,
            }));

            const { error: tagError } = await supabase
                .from("knowledge_tags")
                .insert(tagData);

            if (tagError) {
                setError("タグの登録に失敗しました");
                console.error(tagError);
                return false;
            }
        }

        await fetchKnowledges();
        return true;
    };

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

    const searchKnowledges = knowledges.filter((knowledge) => {
        const query = searchInputQuery.trim().toLowerCase();

        const matchesQuery =
            knowledge.title.toLowerCase().includes(query) ||
            knowledge.body.toLowerCase().includes(query);

        const matchesTags =
            selectedTagIds.length === 0 ||
            selectedTagIds.some((tagId) =>
                knowledge.tagIds.includes(tagId)
            );

        const matchesCategory =
            selectedCategoryId === null ||
            knowledge.categoryId === selectedCategoryId;

        return matchesQuery && matchesTags && matchesCategory;
    });

    const updateKnowledge = async (
        knowledgeId: number,
        title: string,
        categoryId: number,
        tagIds: number[],
        body: string,
        basis: string | null,
    ): Promise<boolean> => {
        const { error: updateError } = await supabase
            .from("knowledge_items")
            .update({
                title,
                category_id: categoryId,
                body,
                basis,
            })
            .eq("id", knowledgeId);

        if (updateError) {
            console.error("ナレッジ更新エラー:", updateError);
            return false;
        }

        const { error: removeTagError } = await supabase
            .from("knowledge_tags")
            .delete()
            .eq("knowledge_id", knowledgeId);

        if (removeTagError) {
            console.error("タグ削除エラー:", removeTagError);
            return false;
        }

        if (tagIds.length > 0) {
            const tagData = tagIds.map((tagId) => ({
                knowledge_id: knowledgeId,
                tag_id: tagId,
            }));

            const { error: addTagError } = await supabase
                .from("knowledge_tags")
                .insert(tagData);

            if (addTagError) {
                console.error("タグ登録エラー:", addTagError);
                return false;
            }
        }

        await fetchKnowledges();

        return true;
    }

    const deleteKnowledge = async (knowledgeId: number) => {
        const confirmed = window.confirm(
            "このナレッジを削除しますか？"
        );

        if (!confirmed) return;

        setDeletingId(knowledgeId);

        try {
            const { error: deleteTagError } = await supabase
                .from("knowledge_tags")
                .delete()
                .eq("knowledge_id", knowledgeId);

            if (deleteTagError) {
                console.error("タグ情報の削除エラー:", deleteTagError);
                return;
            }

            const { error: deleteError } = await supabase
                .from("knowledge_items")
                .delete()
                .eq("id", knowledgeId);

            if (deleteError) {
                console.error("ナレッジの削除エラー:", deleteError);
                return;
            }

            await fetchKnowledges();
        } catch (error) {
            console.error("削除エラー:", error);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <main className="mx-auto max-w-5xl p-8">
            <div className="flex items-center justify-between">
                {error && (
                    <p className="text-sm text-red-500" role="alert">
                        {error}
                    </p>
                )}
                <h2 className="text-2xl font-bold text-gray-800">
                    知識一覧
                </h2>
                <button
                    onClick={onModalOpen}
                    className="btn bg-teal-700 py-4 text-white border-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="text-base">知識を登録</span>
                </button>
            </div>
            <KnowledgeModal
                modalRef={addKnowledgeModal}
                onModalClose={onModalClose}
                addKnowledge={addKnowledge}
                tags={tags}
                onTagAdded={(tag) => {
                    setTags((prev) => [...prev, tag]);
                }}
                categories={categories}
                onCategoryAdded={(category) => {
                    setCategories((prev) => [...prev, category]);
                }}
                editingKnowledge={editingKnowledge}
                updateKnowledge={updateKnowledge}
            />
            <div className="mt-8 flex items-center gap-3">
                <SearchInput
                    inputQuery={searchInputQuery}
                    onInputQueryChange={setSearchInputQuery}
                />
            </div>
            <div className="mt-2 flex gap-2">
                <SelectTags
                    inputQuery={searchInputTagQuery}
                    onInputQueryChange={setSearchInputTagQuery}
                    tags={tags}
                    selectedTagIds={selectedTagIds}
                    onSelectedTagIdsChange={setSelectedTagIds}
                />
                <SelectCategory
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onSelectedCategoryIdChange={setSelectedCategoryId} />
            </div>
            <div className="mt-8 grid gap-4">
                {searchKnowledges.map((knowledge) => (
                    <KnowledgeCard
                        key={knowledge.id}
                        knowledge={knowledge}
                        tags={tags}
                        onEdit={onEditModalOpen}
                        onDelete={deleteKnowledge}
                        isDeleting={deletingId === knowledge.id} />
                ))}
            </div>
        </main>
    );
};

export default Body;