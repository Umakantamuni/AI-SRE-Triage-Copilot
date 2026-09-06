import { useState } from "react";
import Icon from "../components/Icon";
import { searchKnowledge } from "../services/api";

interface KnowledgeProps {
  onNavigate: (page: string) => void;
}

interface KnowledgeResult {
  id: string;
  title: string;
  content: string;
  source: string;
  type: string;
  score?: number | null;
}

function normalizeResult(
  item: unknown,
  index: number
): KnowledgeResult {
  if (typeof item === "string") {
    return {
      id: `result-${index}`,
      title: `Knowledge Result ${index + 1}`,
      content: item,
      source: "Knowledge Base",
      type: "document",
      score: null,
    };
  }

  if (
    typeof item !== "object" ||
    item === null
  ) {
    return {
      id: `result-${index}`,
      title: `Knowledge Result ${index + 1}`,
      content: String(item ?? ""),
      source: "Knowledge Base",
      type: "document",
      score: null,
    };
  }

  const data = item as Record<string, unknown>;

  const metadata =
    typeof data.metadata === "object" &&
    data.metadata !== null
      ? (data.metadata as Record<string, unknown>)
      : {};

  const title =
    data.title ??
    data.name ??
    metadata.title ??
    metadata.name ??
    `Knowledge Result ${index + 1}`;

  const content =
    data.content ??
    data.text ??
    data.snippet ??
    data.description ??
    metadata.content ??
    metadata.text ??
    "";

  const source =
    data.source ??
    data.file ??
    data.filename ??
    metadata.source ??
    metadata.file ??
    "Knowledge Base";

  const type =
    data.type ??
    data.category ??
    metadata.type ??
    metadata.category ??
    "document";

  const rawScore =
    data.score ??
    data.similarity ??
    data.relevance ??
    metadata.score ??
    null;

  const score =
    typeof rawScore === "number"
      ? rawScore
      : null;

  const id =
    data.id ??
    data.document_id ??
    data.chunk_id ??
    metadata.id ??
    `result-${index}`;

  return {
    id: String(id),
    title: String(title),
    content: String(content),
    source: String(source),
    type: String(type),
    score,
  };
}

function formatScore(
  score?: number | null
) {
  if (
    score === null ||
    score === undefined ||
    Number.isNaN(score)
  ) {
    return null;
  }

  const percentage =
    score <= 1
      ? Math.round(score * 100)
      : Math.round(score);

  return `${Math.max(
    0,
    Math.min(100, percentage)
  )}%`;
}

function getTypeIcon(type: string) {
  const normalized = type.toLowerCase();

  if (
    normalized.includes("incident") ||
    normalized.includes("alert")
  ) {
    return "alert" as const;
  }

  if (
    normalized.includes("runbook") ||
    normalized.includes("procedure")
  ) {
    return "book" as const;
  }

  if (
    normalized.includes("log") ||
    normalized.includes("error")
  ) {
    return "terminal" as const;
  }

  return "document" as const;
}

export default function Knowledge({
  onNavigate,
}: KnowledgeProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] =
    useState<KnowledgeResult[]>([]);
  const [loading, setLoading] =
    useState(false);
  const [searched, setSearched] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  async function handleSearch() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setSearched(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearched(true);

      const response =
        await searchKnowledge(trimmedQuery);

      const normalized = Array.isArray(response)
        ? response.map(normalizeResult)
        : [];

      setResults(normalized);
    } catch (err) {
      setResults([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to search knowledge base."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setSearched(false);
    setError(null);
  }

  return (
    <div className="knowledge-page">
      {/* Header */}
      <section className="page-hero">
        <div>
          <div className="section-eyebrow">
            OPERATIONAL INTELLIGENCE
          </div>

          <h2>Knowledge Base</h2>

          <p>
            Search incidents, runbooks, troubleshooting
            guides and operational knowledge using
            semantic retrieval.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => onNavigate("runbooks")}
        >
          <Icon name="book" size={16} />
          Browse Runbooks
        </button>
      </section>

      {/* Search */}
      <section className="panel knowledge-search-panel">
        <div className="knowledge-search-box">
          <Icon
            name="search"
            size={20}
          />

          <input
            type="text"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Search incidents, errors, services, runbooks..."
            aria-label="Search knowledge base"
          />

          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={clearSearch}
              title="Clear search"
            >
              <Icon
                name="close"
                size={16}
              />
            </button>
          )}

          <button
            type="button"
            className="primary-button"
            onClick={handleSearch}
            disabled={
              loading || !query.trim()
            }
          >
            {loading ? (
              <>
                <span className="button-spinner" />
                Searching...
              </>
            ) : (
              <>
                <Icon
                  name="search"
                  size={16}
                />
                Search
              </>
            )}
          </button>
        </div>

        <div className="knowledge-search-hint">
          <span>
            Try:
          </span>

          <button
            type="button"
            onClick={() => {
              setQuery(
                "database connection timeout"
              );
            }}
          >
            database connection timeout
          </button>

          <button
            type="button"
            onClick={() => {
              setQuery(
                "HTTP 500 error spike"
              );
            }}
          >
            HTTP 500 error spike
          </button>

          <button
            type="button"
            onClick={() => {
              setQuery(
                "API latency troubleshooting"
              );
            }}
          >
            API latency troubleshooting
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="error-banner">
          <Icon
            name="alert"
            size={18}
          />

          <div>
            <strong>
              Knowledge search failed
            </strong>

            <span>
              {error}
            </span>
          </div>
        </div>
      )}

      {/* Initial State */}
      {!searched && !loading && !error && (
        <section className="panel knowledge-empty-panel">
          <div className="knowledge-empty-icon">
            <Icon
              name="search"
              size={28}
            />
          </div>

          <h3>
            Search operational knowledge
          </h3>

          <p>
            Find relevant incidents, runbooks,
            troubleshooting procedures and
            historical operational context.
          </p>

          <div className="knowledge-capabilities">
            <div>
              <Icon
                name="alert"
                size={18}
              />
              <span>
                Incident History
              </span>
            </div>

            <div>
              <Icon
                name="book"
                size={18}
              />
              <span>
                Runbooks
              </span>
            </div>

            <div>
              <Icon
                name="terminal"
                size={18}
              />
              <span>
                Error Patterns
              </span>
            </div>

            <div>
              <Icon
                name="database"
                size={18}
              />
              <span>
                Service Knowledge
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Loading */}
      {loading && (
        <section className="panel knowledge-results-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                Searching Knowledge
              </div>

              <div className="panel-subtitle">
                Retrieving relevant operational context...
              </div>
            </div>
          </div>

          <div className="knowledge-loading">
            <div className="knowledge-skeleton" />
            <div className="knowledge-skeleton" />
            <div className="knowledge-skeleton" />
          </div>
        </section>
      )}

      {/* Results */}
      {!loading &&
        searched &&
        results.length > 0 && (
          <section className="panel knowledge-results-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  Search Results
                </div>

                <div className="panel-subtitle">
                  {results.length} relevant knowledge{" "}
                  {results.length === 1
                    ? "item"
                    : "items"}{" "}
                  found
                </div>
              </div>

              <div className="knowledge-result-count">
                {results.length}
              </div>
            </div>

            <div className="knowledge-results">
              {results.map((result, index) => {
                const score =
                  formatScore(result.score);

                return (
                  <article
                    key={`${result.id}-${index}`}
                    className="knowledge-result-card"
                  >
                    <div className="knowledge-result-icon">
                      <Icon
                        name={getTypeIcon(
                          result.type
                        )}
                        size={19}
                      />
                    </div>

                    <div className="knowledge-result-content">
                      <div className="knowledge-result-top">
                        <div>
                          <span className="knowledge-type">
                            {result.type}
                          </span>

                          <h3>
                            {result.title}
                          </h3>
                        </div>

                        {score && (
                          <div className="knowledge-score">
                            <span>
                              Relevance
                            </span>
                            <strong>
                              {score}
                            </strong>
                          </div>
                        )}
                      </div>

                      <p>
                        {result.content ||
                          "No preview available for this knowledge item."}
                      </p>

                      <div className="knowledge-result-footer">
                        <span>
                          <Icon
                            name="document"
                            size={14}
                          />
                          {result.source}
                        </span>

                        <span>
                          Knowledge Base
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

      {/* No Results */}
      {!loading &&
        searched &&
        !error &&
        results.length === 0 && (
          <section className="panel knowledge-empty-panel">
            <div className="knowledge-empty-icon">
              <Icon
                name="search"
                size={28}
              />
            </div>

            <h3>
              No matching knowledge found
            </h3>

            <p>
              No operational knowledge matched{" "}
              <strong>
                "{query}"
              </strong>
              .
            </p>

            <button
              type="button"
              className="secondary-button"
              onClick={clearSearch}
            >
              Clear Search
            </button>
          </section>
        )}
    </div>
  );
}