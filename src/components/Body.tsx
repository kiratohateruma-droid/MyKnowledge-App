import KnowledgeModal from "./KnowledgeModal";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../utils/supabase";

interface Knowledge {
    id: number;
    title: string;
    categoryId: number;
    categoryName: string;
    tagIds: number[];
    tagNames: string[];
    body: string;
    basis: string | null;
}


const Body = () => {
    const addKnowledgeModal = useRef<HTMLDialogElement>(null);
    const [knowledges, setKnowledges] = useState<Knowledge[]>([]);
    const [error, setError] = useState("");

    const onModalOpen = () => {
        addKnowledgeModal.current?.showModal();
    };

    const onModalClose = () => {
        addKnowledgeModal.current?.close();
    };

    // Supabaseから知識一覧を取得
    const fetchKnowledges = async () => {
        const { data, error: fetchError } = await supabase
            .from("knowledge_items")
            .select(`
                id,
                title,
                category_id,
                body,
                basis,
                categories (
                    name
                ),
                knowledge_tags (
                    tag_id,
                    tags (
                        name
                    )
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
            categoryName: item.categories?.[0]?.name ?? "未設定",
            tagIds: item.knowledge_tags.map((item) => item.tag_id),
            tagNames: item.knowledge_tags
                .map((tagItem) => tagItem.tags?.[0]?.name)
                .filter((name): name is string => Boolean(name)),
            body: item.body,
            basis: item.basis,
        }));

        setKnowledges(fetchedData);
        setError("");
    };

    // 画面表示時に一覧を取得
    useEffect(() => {
        fetchKnowledges();
    }, []);

    // 知識を登録
    const addKnowledge = async (
        title: string,
        categoryId: number,
        tagIds: number[],
        body: string,
        basis: string | null,
    ): Promise<boolean> => {

        // 知識本体を登録
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

        // 登録後に一覧を再取得
        await fetchKnowledges();
        return true;
    };

    return (
        <main className="mx-auto max-w-6xl p-8">
            <div className="flex items-center justify-between">
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
            />
            <div className="mt-8 flex items-center gap-3">
                {/* 検索欄 */}
                {/* カテゴリ選択 */}
                {/* タグ選択 */}
            </div>
            <div className="mt-8 grid gap-4">
                {knowledges.map((knowledge) => (
                    <article
                        key={knowledge.id}
                        className="rounded-lg border border-gray-200 bg-white p-4"
                    >
                        <h3 className="text-lg font-semibold text-gray-800">
                            {knowledge.title}
                        </h3>

                        <p className="mt-2 text-sm text-gray-500">
                            カテゴリ：{knowledge.categoryName}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                            {knowledge.tagNames.map((tagName) => (
                                <span
                                    key={tagName}
                                    className="rounded-full bg-teal-100 px-3 py-1 text-sm text-teal-800"
                                >
                                    {tagName}
                                </span>
                            ))}
                        </div>

                        <p className="mt-2 whitespace-pre-wrap text-gray-700">
                            {knowledge.body}
                        </p>

                        {knowledge.basis && (
                            <a
                                href={knowledge.basis}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 block text-blue-600 underline"
                            >
                                参考URL
                            </a>
                        )}
                    </article>
                ))}
            </div>
        </main>
    );
};

export default Body;