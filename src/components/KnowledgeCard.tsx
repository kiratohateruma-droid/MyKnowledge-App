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

interface KnowledgeCardProps {
    knowledge: Knowledge;
    tags: Tag[];
    onEdit: (knowledge: Knowledge) => void;
    onDelete: (id: number) => void;
    isDeleting: boolean;
}

const KnowledgeCard = (props: KnowledgeCardProps) => {
    const { knowledge, tags } = props;

    return (
        <article className="rounded-lg border border-gray-300 bg-white p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                    {knowledge.title}
                </h3>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => props.onDelete(knowledge.id)}
                        disabled={props.isDeleting}
                        className="btn btn-sm border-0 bg-red-600 text-white"
                    >
                        {props.isDeleting ? "削除中..." : "削除"}
                    </button>
                    <button
                        type="button"
                        onClick={() => props.onEdit(knowledge)}
                        className="btn btn-sm"
                    >
                        編集
                    </button>
                </div>
            </div>

            <p className="mt-2 text-sm text-gray-500">
                カテゴリ：{knowledge.categoryName}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
                {knowledge.tagIds.map((tagId) => {
                    const tag = tags.find((item) => item.id === tagId);

                    if (!tag) return null;

                    return (
                        <span
                            key={tag.id}
                            className="rounded-full bg-teal-100 px-3 py-1 text-sm text-teal-800"
                        >
                            {tag.name}
                        </span>
                    );
                })}
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
                    参考：{knowledge.basis}
                </a>
            )}
        </article>
    );
};

export default KnowledgeCard;