\# AI SRE Incident Triage Copilot

\## System Architecture



\## 1. Architecture Overview



The AI SRE Incident Triage Copilot follows a layered enterprise application architecture.



The platform separates:



\- User interface

\- API layer

\- Authentication and authorization

\- Business services

\- AI and RAG services

\- Data persistence

\- External integrations

\- Audit and operational controls



High-level architecture:



```text

&#x20;                        +----------------------+

&#x20;                        |   SRE / Operations   |

&#x20;                        |        User          |

&#x20;                        +----------+-----------+

&#x20;                                   |

&#x20;                                   v

&#x20;                        +----------------------+

&#x20;                        |    React Frontend    |

&#x20;                        | React + TypeScript   |

&#x20;                        |      + Vite          |

&#x20;                        +----------+-----------+

&#x20;                                   |

&#x20;                             HTTP / REST

&#x20;                                   |

&#x20;                                   v

&#x20;                        +----------------------+

&#x20;                        |      FastAPI API     |

&#x20;                        |   Routing / Models   |

&#x20;                        +----------+-----------+

&#x20;                                   |

&#x20;             +---------------------+----------------------+

&#x20;             |                     |                      |

&#x20;             v                     v                      v

&#x20;      +-------------+       +-------------+       +-------------+

&#x20;      |    Core     |       |  Services   |       |     RAG     |

&#x20;      | Auth / RBAC |       | Business    |       | Knowledge   |

&#x20;      | Middleware  |       | Logic       |       | Retrieval   |

&#x20;      +-------------+       +------+------+       +------+------+

&#x20;                                   |                     |

&#x20;                        +----------+---------+           |

&#x20;                        |                    |           |

&#x20;                        v                    v           v

&#x20;                 +-------------+      +-------------+ +-------------+

&#x20;                 | PostgreSQL  |      |  Gemini AI  | |  ChromaDB   |

&#x20;                 | Application |      | AI Triage   | | Vector DB   |

&#x20;                 |    Data     |      +-------------+ +-------------+

&#x20;                 +------+------+                           

&#x20;                        |

&#x20;                        v

&#x20;                 +-------------+

&#x20;                 | Audit Logs  |

&#x20;                 +-------------+



&#x20;                        External Integration

&#x20;                               |

&#x20;                               v

&#x20;                      +------------------+

&#x20;                      |    ServiceNow    |

&#x20;                      | Integration      |

&#x20;                      +------------------+

