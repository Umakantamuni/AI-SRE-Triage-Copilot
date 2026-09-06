\# AI SRE Incident Triage Copilot



An enterprise-grade AI-powered SRE Incident Triage Copilot for intelligent incident analysis, root cause investigation, knowledge retrieval, and operational incident management.



The platform combines SRE workflows, AI-assisted triage, Retrieval-Augmented Generation (RAG), RBAC, audit logging, and ITSM integration foundations into a unified operational platform.



\---



\## Overview



Production incidents often require engineers to manually investigate alerts, logs, previous incidents, knowledge bases, runbooks, and troubleshooting procedures.



This project aims to reduce that operational effort by providing a centralized platform where SRE and operations teams can:



\- Create and manage incidents

\- Analyze incidents using AI

\- Retrieve relevant operational knowledge

\- Investigate probable root causes

\- Receive remediation recommendations

\- Track incident lifecycle

\- Record resolution and closure information

\- Maintain an audit trail



The system is designed as a human-in-the-loop platform where AI assists engineers while final operational decisions remain with authorized users.



\---



\## Architecture



```text

&#x20;                   SRE / Operations User

&#x20;                            |

&#x20;                            v

&#x20;                   React + TypeScript

&#x20;                        Frontend

&#x20;                            |

&#x20;                            v

&#x20;                        FastAPI

&#x20;                          API

&#x20;                            |

&#x20;         +------------------+------------------+

&#x20;         |                  |                  |

&#x20;         v                  v                  v

&#x20;    Incident             AI Triage          Knowledge

&#x20;     Service              Service             / RAG

&#x20;         |                  |                  |

&#x20;         v                  v                  v

&#x20;    PostgreSQL           Gemini AI          ChromaDB

&#x20;         |

&#x20;         v

&#x20;     Audit Logs

