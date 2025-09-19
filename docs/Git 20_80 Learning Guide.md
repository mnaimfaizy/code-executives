

# **A 20/80 Study Guide to Git: The Architecture, Workflow, and Essential Practices for Modern Development**

## **Part I: The Foundational 20% \- Git's Core Concepts and Philosophy**

### **The Why and What of Git**

The landscape of modern software development is complex and collaborative, demanding a systematic way to track changes, manage different versions, and coordinate the work of multiple contributors. This necessity gave rise to Version Control Systems (VCS), tools designed to record modifications to files over time, enabling developers to recall specific versions later. While various VCS options have existed, Git has emerged as the dominant choice, utilized by millions of developers and organizations worldwide due to its unique features, flexibility, and widespread adoption.1

At its core, Git is a distributed version control system (DVCS).3 This architectural choice represents a significant paradigm shift from older, centralized systems where a single central repository or server was the sole authority. In the distributed model, every team member possesses a "full-fledged copy of the entire project on their local repository".4 This means that a local clone of a project is a complete version control repository in itself, containing the entire history of the project.3 This decentralization provides a number of powerful advantages, including the ability to work offline or remotely with full functionality, and enhanced project resilience, as every local clone serves as a complete backup.3

Git's popularity is rooted in its foundational principles of security, speed, and flexibility. The integrity of managed source code is a top priority in its design, secured by a cryptographically secure hashing algorithm called SHA-1.6 This algorithm protects the content of files, the relationships between files and directories, versions, tags, and commits against both accidental and malicious alteration.6 Because every piece of data is hashed, it becomes impossible to modify, lose, or corrupt files without Git detecting it.3 This cryptographic security provides an unparalleled level of trust in the project's history and audit trail, which is a critical feature for any professional software development team.6 This is the core reason why Git can operate in a distributed, decentralized manner without a central authority validating every change. The SHA-1 hash functions as a unique checksum of the content, meaning any change to the data—even a single character—produces a completely different hash, guaranteeing the authenticity and traceability of the code history.7 Beyond security, Git is designed for performance and flexibility. Most operations are local, which makes them exceptionally fast, and the system is built to support various kinds of nonlinear development workflows, with branching and tagging treated as first-class citizens.6 Its open-source nature has also fostered a strong community and deep integration into a wide array of development tools and platforms, simplifying the day-to-day workflow for developers.3

### **The Three-Tree Architecture**

To understand how Git operates, it is essential to grasp its fundamental three-tree architecture. This conceptual model divides a project's state into three distinct areas, each with a specific purpose. This separation allows for a highly controlled and selective approach to tracking changes, which is a key differentiator of Git compared to other version control systems.

The first tree is the **Working Directory** (also called the Working Tree).9 This is the physical directory on a user's local disk where the project's files reside.9 It represents a single checkout of one version of the project, with files placed on the disk for a developer to use, create, or modify.9 In this state, files are considered either

modified (changed but not yet staged) or untracked (newly created and not yet under Git's management).9

The second tree is the **Staging Area**, also known as the "index".9 This is a special file, typically contained within the

.git directory, that acts as an intermediate holding space.9 The staging area's primary purpose is to allow a developer to build a selective snapshot of the changes that will be included in the next commit.9 Instead of being forced to commit all modifications at once, a developer can

stage specific files or changes using the git add command, moving them from the working directory into the staging area.3 Once a file is in the staging area, it is considered

staged and is ready to be committed.9 This architectural choice enables the creation of small, logical, and focused commits.3 A developer can work on multiple changes, such as a bug fix and a new feature, and then use the staging area to commit them as two separate, distinct snapshots. This practice makes code reviews easier, simplifies debugging by pinpointing the exact commit that introduced a problem, and reduces the risk of introducing new bugs, all of which are critical for professional teams.14 The staging area is the foundational component that directly enables this crucial collaborative practice.

The third and final tree is the **Git Directory** (also known as the local repository).9 This is the most important part of Git, represented by the hidden

.git folder in the project's root.9 It is where Git stores all the project's metadata and its object database.9 Once data from the staging area is packaged into a commit, it is permanently and safely stored in this directory. A file in the Git directory is considered

committed.9 The entire project history resides here, and this is the data that is copied when a repository is cloned from another computer.9

The following table provides a clear summary of Git's three-tree architecture and the role of each component.

| State Name | File Status | Associated Command(s) | Role |
| :---- | :---- | :---- | :---- |
| Working Directory | Modified or Untracked | N/A | Where files are actively edited, created, or deleted. |
| Staging Area (Index) | Staged | git add | An intermediate holding area for changes selected for the next commit. |
| Git Directory (Repository) | Committed | git commit | The permanent, immutable database where project history is stored. |

## **Part II: The Architectural 20% \- How Git Really Works Under the Hood**

### **Git's Content-Addressable Database**

A deeper understanding of Git's functionality requires looking beyond its commands and into its internal architecture. At its core, Git is a content-addressable filesystem, meaning it is a simple key-value data store where the key is a cryptographic hash of the content itself.7 This hash, or unique key, is a 40-character SHA-1 checksum of the content plus a header. This means that a piece of data can be retrieved from the database by simply knowing its hash, and conversely, any change to the data will produce a completely different hash.7 This property is the bedrock of Git's security model, as it makes the repository's history and data completely auditable and tamper-proof.3

Git stores all project data as one of four fundamental object types: blobs, trees, commits, and tags.7 Each object is stored as a file in the

.git/objects directory and is named after its unique SHA-1 hash, where the first two characters of the hash form a subdirectory and the remaining 38 characters serve as the filename.7

* **Blob Object:** A blob is the most basic object type. It stores the raw content of a file but contains no metadata about the file's name, permissions, or location.7 If two different files in a repository contain identical content, they will share the same blob object, making Git highly efficient in its storage.8  
* **Tree Object:** A tree object represents a directory.7 It contains a list of pointers to other blob and tree objects, along with the file modes and names.7 This object type effectively creates a snapshot of the directory's contents and structure at a specific point in time.15  
* **Commit Object:** A commit object is the cornerstone of Git's history.7 It captures a complete snapshot of the project at a given moment by pointing to a single root tree object.7 In addition to this snapshot reference, a commit object contains critical metadata, including pointers to its parent commit(s), the author's and committer's name and timestamp, and the commit message.7 This structure is what allows for a traceable and detailed project history.  
* **Tag Object:** A tag is a permanent, named reference to a specific commit.8 It is typically used to mark important points in the project's history, such as official releases.8 Unlike a branch, a tag does not move once created.14

The relationships between these objects are what form the Directed Acyclic Graph (DAG) that represents the project's history.12 A commit object points to a single tree object for its project snapshot and to its parent commit(s).15 The tree object, in turn, points to the blobs and other trees that make up its contents.8 This chain of pointers forms the project history, where each commit serves as a node in the graph, with the direction of the pointers always moving backward toward its ancestors.12 This elegant structure is why commands like

git log can traverse the project's history with ease and why Git can perform operations like git checkout so quickly. When a developer checks out a specific commit, Git simply updates the working directory to match the specified snapshot, rather than applying a series of patches, a process that is far more efficient than the linear change-tracking models of older VCS. The object-oriented model of Git is not just an implementation detail; it is the very essence of how it achieves version control by storing a series of full project snapshots instead of a collection of linear diffs.17

A visual representation of this data model would show the following: a commit object at the top, with a pointer extending to a tree object, which represents the project's root directory. The tree object would then have pointers to various blob objects, representing files, and other tree objects, representing subdirectories. Critically, the commit object would also have a pointer to its parent commit object, with the chain of these pointers forming the project's history.

## **Part III: The Practical 20% \- Essential Git Techniques and Workflows**

### **The Core Git Workflow: From Local to Remote**

Git provides a streamlined workflow for managing code changes from a local machine to a shared, remote repository. The foundation of this process begins with initializing or cloning a repository. To begin tracking a new project locally, the git init command is used to "initialize a new Git repository" within an existing folder, creating the essential .git directory.10 For a project that already exists on a remote server, the

git clone command is used to "create a local duplicate of a repository," downloading the entire codebase, history, and branches, and establishing the connection for future synchronization.10

The standard cycle of Git involves a three-step process: modifying files, staging changes, and committing the snapshot. A developer first modifies files in their working directory. To check the current state of their project, the git status command is used.10 This command is an indispensable tool, showing which files are

modified, untracked, or staged for the next commit.11 Once a developer is ready to save a change, they use

git add to move files from the working directory to the staging area.10 This step is crucial, as it allows for the creation of focused, logical commits by giving a developer granular control over which changes are included in the next snapshot.3 Finally, the

git commit command is used to package the staged files into a permanent snapshot and store it in the local repository.3 It is a best practice to include a descriptive commit message with the

\-m flag, as this message becomes a permanent part of the project's history, providing vital context for why a change was made.12 A good commit message serves as a critical communication tool that tells a story and helps other developers understand a project's evolution, troubleshoot issues, and perform code reviews.12

After changes are committed locally, they can be shared with the rest of the team. The git push command is used to "upload local commits to a remote repository," making them accessible to others.11 Similarly, the

git pull command is used to "keep your local repository up to date with the remote repository" by fetching and merging changes made by others.11 This command is a combination of

git fetch (downloading new commits) and git merge (integrating them into the local branch).13

### **Branching, Merging, and Collaboration**

Git's support for branching is a key feature that enables flexible and simultaneous development.3 A branch in Git is not a full copy of the codebase but a "lightweight pointer" to a specific commit.3 When a new commit is made, the branch pointer simply moves forward to the new commit.20 This low-cost, high-speed approach to branching is what allows developers to work on new features or bug fixes in isolation without affecting the main codebase.3

Several key commands are used to manage branches. The git branch command is used to create, list, and delete branches.11 To move between branches, the

git switch or git checkout commands are used.11 The

git switch command is a more modern, single-purpose command, while git checkout has a more general function.11

Once work on a feature branch is complete, it needs to be integrated back into the main line of development. The git merge command is used to combine the changes from one branch into another.21 Git employs different strategies for merging, depending on the state of the branch histories. In a "fast-forward merge," where the target branch's last commit is an ancestor of the source branch's last commit, Git simply moves the target branch's pointer forward to the latest commit.21 This is a trivial operation that leaves a linear history. When the histories have diverged, Git performs a "three-way merge".20 This involves using the two branch tips and their common ancestor to create a new "merge commit" that integrates the changes.21 This new commit is special because it has multiple parents, preserving the full, non-linear history of the project.21 This capability of easily creating and merging branches is a cornerstone of modern software development workflows, allowing teams to collaborate efficiently without interfering with each other's work.3

A visual representation of this process would show a linear commit history, with commits represented as nodes and arrows pointing to their parents. A new branch would appear as a new pointer stemming from a specific commit. A three-way merge would be visualized as two divergent branches and a third new commit created with two arrows pointing to the tips of the branches that were merged, preserving the full project history.

### **Navigating and Rewriting History**

In professional development, it is often necessary to review, modify, or correct the project history. Git provides several powerful commands for this. The git log command is the primary tool for reviewing the history of commits, providing a chronological list of all commits in the repository.12 To inspect a specific commit in detail, the

git show command is used, which displays the commit's ID, author, date, message, and the specific content changes that were made.11

One of the most nuanced and important choices in Git is the decision between git merge and git rebase for integrating changes.22 While both commands achieve a similar result of combining histories, their underlying approach and the resulting commit history are fundamentally different.

* git merge is a safe option that preserves the entire history of the repository.22 It combines the histories of two branches by creating a new merge commit, which explicitly records the point at which the two histories were joined.22 This approach maintains the context of the branch and creates a complete log that can be valuable for understanding the big picture of a project's evolution.22 However, this can lead to a "clumsy history and log" with "merge commit noise" that can make the log difficult to read in busy repositories.22  
* git rebase is an alternative that rewrites history.22 It works by moving the commits from one branch onto the tip of another, creating a more organized, linear project history.22 It avoids the creation of merge commits and can clean up intermediate commits by squashing them into a single one.22 This results in a cleaner, more streamlined log, which can be easier to read and navigate.22 The major drawback is that by rewriting history, it can make it difficult for collaborators to track how and when commits were merged, and it should never be used on a shared public branch.22

The choice between these two commands is a philosophical one. Merge is better for preserving a verifiable, chronological history, while rebase is better for maintaining a clean, linear history. A developer's choice should depend on their team's workflow and whether the branch being integrated is shared or private.22

| Feature | Git Merge | Git Rebase |
| :---- | :---- | :---- |
| **Philosophy** | Preserves history, merges separate lines of development. | Rewrites history, creates a single, linear line of development. |
| **Log Appearance** | Non-linear, with merge commits. | Linear, clean log without merge commits. |
| **Use Case** | Best used for shared, public branches. | Best used for private, local branches to clean up history before pushing. |
| **Pros** | Preserves full history and context, makes it easy to track changes.22 | Streamlines complex history, avoids merge commit noise, lack of clutter.22 |
| **Cons** | Can result in a clumsy, noisy log, not very user-friendly.22 | Rewrites history, can't be used on shared branches, requires resolving conflicts repeatedly.22 |

When Git cannot automatically merge changes—for example, if the same part of the same file has been modified differently in two branches—a **merge conflict** occurs.21 Git pauses the merge process and flags the conflicted files, leaving special conflict markers in the file.21 To resolve a conflict, a developer must manually edit the file to incorporate the desired changes, remove the conflict markers (

\<\<\<\<\<\<\<, \=======, \>\>\>\>\>\>\>), and then stage (git add) and commit the resolved file to complete the merge.21

### **Common Professional Workflows**

A good Git workflow is a set of rules and best practices that a team follows to ensure the main codebase remains stable, collaborators don't interfere with each other's work, and the project history is clear and traceable.28 Two of the most dominant branching methodologies for professional teams are Git Flow and GitHub Flow.

* **Git Flow:** This is a comprehensive and structured branching strategy designed for projects with a systematic release cycle.29 It uses a distinct branch hierarchy, including a  
  main branch for production-ready code and a develop branch for integrating new features.29  
  Feature branches are created for new development, release branches are used for final bug fixes before a release, and hotfix branches are for critical production bugs.29 This model enables parallel development and provides a clear, stable release history.29 However, its complexity can be overwhelming for smaller teams, and the multiple merges can lead to frequent conflicts and delayed feature releases.29  
* **GitHub Flow:** This is a streamlined and agile approach designed for rapid releases and continuous delivery.28 It revolves around a single, always-deployable  
  main branch.28 New features or fixes are developed on new branches, and once they are ready, they are merged back into  
  main via a pull request.28 This model prioritizes simplicity and speed, with fewer branches and fewer merges, which reduces the chance of merge conflicts.29 It works best in environments that have rigorous automated testing, as a lapse in testing could lead to unstable code being deployed to production.29

The following table provides a comparative analysis of these two models to help a team select the best workflow for their specific needs.29

| Feature | Git Flow | GitHub Flow |
| :---- | :---- | :---- |
| **Philosophy** | Structured, systematic, and geared for parallel development. | Simple, agile, and focused on continuous delivery. |
| **Branching Model** | Multiple branches: main, develop, feature, release, hotfix. | Lean, with a main branch and new feature branches created from it. |
| **Release Frequency** | Delayed, as features go through several stages before deployment. | Rapid, with features and fixes going live faster. |
| **Complexity** | High, requires diligent branch management and a steep learning curve. | Low, straightforward, and suitable for smaller teams. |
| **Ideal Use Case** | Large, complex projects requiring parallel development and a clear, systematic workflow. | Smaller projects and teams that prioritize speed, continuous delivery, and simplicity. |

Regardless of the chosen workflow, several best practices are universally beneficial for team collaboration.14 These include: committing small, frequent, and logical changes; using descriptive and semantic commit messages; leveraging pull requests for code reviews and knowledge sharing; and protecting important branches like

main by requiring pull requests and automated checks.3 It is also recommended to use a

.gitignore file to keep sensitive files and dependencies out of the repository and to use Git Large File Storage (Git LFS) for large binary files to optimize performance.14

## **Part IV: The Troubleshooting 20% \- Fixing Mistakes and Finding Bugs**

### **Common Mistakes and How to Fix Them**

Even for experienced developers, mistakes are inevitable. Git provides a powerful set of tools for correcting them, but it is crucial to understand the implications of each command. For small corrections to the last commit, the git commit \--amend command is used to edit the commit message or add forgotten files to the previous commit without creating a new one.20 It is critical to avoid using this command on commits that have already been pushed to a shared remote repository, as it rewrites history and can cause conflicts for others.33

For larger mistakes, the git reset command provides a way to undo local commits.20 The command moves the branch pointer to a previous commit, and its behavior depends on the flag used.

git reset \--soft undoes the commit but keeps the changes staged, while git reset \--hard discards the commits and all changes completely, returning the working directory to a clean state.20 A safer alternative to undoing a commit, especially one that has been pushed, is

git revert.33 Instead of deleting the commit,

git revert creates a *new* commit that undoes the changes of a previous one, preserving the full project history.33

Another common problem is trying to locate the specific commit that introduced a bug. Manually checking out old commits is a tedious and time-consuming process.35 Git's architecture, however, provides an elegant solution. The

git bisect command leverages a "divide and conquer" or "binary search" approach to automatically find the offending commit.35 A developer starts the process by marking a known good commit and a known bad commit.35 Git then automatically checks out a commit halfway between the two and prompts the user to identify if the bug is present.35 By repeating this process,

git bisect can quickly narrow down the search space, isolating the exact commit that introduced the bug.35 This is a direct consequence of Git's object model and DAG, which allow for the fast and reliable checkout of any point in history, a feature that would be impossible with older version control systems.17 This tool can even be automated with a script using

git bisect run.36

## **Conclusion: A Path to Git Proficiency**

The journey to Git proficiency is not about memorizing a hundred commands but about understanding a handful of core concepts and applying a few high-leverage techniques. The principles of the 20/80 rule are perfectly suited for this domain. The 20% of foundational knowledge—including Git's distributed architecture, its cryptographic security, and the three-tree model—provides the conceptual framework to understand why Git behaves the way it does. The 20% of architectural knowledge—the content-addressable database, and the relationships between blobs, trees, and commits—explains how Git accomplishes version control by storing snapshots rather than diffs. This knowledge provides a deep intuition that enables a developer to navigate complex scenarios with confidence.

Finally, the 20% of practical techniques and troubleshooting skills—including the core local-to-remote workflow, the strategic use of branches, the choice between merging and rebasing, and the application of commands like git reset and git bisect—empower a developer to handle 80% of real-world scenarios. A developer equipped with this knowledge can not only use Git effectively but can also contribute to a more disciplined and productive team environment. This report provides a robust foundation for a developer to move from a basic user to a proficient collaborator, capable of leveraging Git's full power to maintain a clean, secure, and traceable codebase.

#### **Works cited**

1. Git vs. Other Version Control Systems: Why Git Stands Out? \- GeeksforGeeks, accessed September 19, 2025, [https://www.geeksforgeeks.org/git/git-vs-other-version-control-systems-why-git-stands-out/](https://www.geeksforgeeks.org/git/git-vs-other-version-control-systems-why-git-stands-out/)  
2. www.geeksforgeeks.org, accessed September 19, 2025, [https://www.geeksforgeeks.org/git/git-vs-other-version-control-systems-why-git-stands-out/\#:\~:text=Among%20the%20various%20VCS%20options,%2C%20flexibility%2C%20and%20widespread%20adoption.](https://www.geeksforgeeks.org/git/git-vs-other-version-control-systems-why-git-stands-out/#:~:text=Among%20the%20various%20VCS%20options,%2C%20flexibility%2C%20and%20widespread%20adoption.)  
3. What is Git? \- Azure DevOps | Microsoft Learn, accessed September 19, 2025, [https://learn.microsoft.com/en-us/devops/develop/git/what-is-git](https://learn.microsoft.com/en-us/devops/develop/git/what-is-git)  
4. about.gitlab.com, accessed September 19, 2025, [https://about.gitlab.com/topics/version-control/benefits-distributed-version-control-system/\#:\~:text=A%20distributed%20version%20control%20system%20decentralizes%20the%20project%20management%20process,project%20on%20their%20local%20repository.](https://about.gitlab.com/topics/version-control/benefits-distributed-version-control-system/#:~:text=A%20distributed%20version%20control%20system%20decentralizes%20the%20project%20management%20process,project%20on%20their%20local%20repository.)  
5. What is a distributed version control system? \- GitLab, accessed September 19, 2025, [https://about.gitlab.com/topics/version-control/benefits-distributed-version-control-system/](https://about.gitlab.com/topics/version-control/benefits-distributed-version-control-system/)  
6. What is Git | Atlassian Git Tutorial, accessed September 19, 2025, [https://www.atlassian.com/git/tutorials/what-is-git](https://www.atlassian.com/git/tutorials/what-is-git)  
7. Git Objects \- Git, accessed September 19, 2025, [https://git-scm.com/book/en/v2/Git-Internals-Git-Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects)  
8. Git Book \- The Git Object Model, accessed September 19, 2025, [https://shafiul.github.io/gitbook/1\_the\_git\_object\_model.html](https://shafiul.github.io/gitbook/1_the_git_object_model.html)  
9. What is Git? \- Git, accessed September 19, 2025, [https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F)  
10. How Git Works \- KodeKloud, accessed September 19, 2025, [https://kodekloud.com/blog/how-git-works/](https://kodekloud.com/blog/how-git-works/)  
11. Top 12 Git commands every developer must know \- The GitHub Blog, accessed September 19, 2025, [https://github.blog/developer-skills/github/top-12-git-commands-every-developer-must-know/](https://github.blog/developer-skills/github/top-12-git-commands-every-developer-must-know/)  
12. Git add, commit, and push \- Graphite, accessed September 19, 2025, [https://graphite.dev/guides/git-add-commit-push](https://graphite.dev/guides/git-add-commit-push)  
13. Basic Git Workflow, accessed September 19, 2025, [https://uidaholib.github.io/get-git/3workflow.html](https://uidaholib.github.io/get-git/3workflow.html)  
14. Best Git Practices to Follow in Teams \- GeeksforGeeks, accessed September 19, 2025, [https://www.geeksforgeeks.org/git/best-git-practices-to-follow-in-teams/](https://www.geeksforgeeks.org/git/best-git-practices-to-follow-in-teams/)  
15. object: Definition, Examples, and Applications | Graph AI, accessed September 19, 2025, [https://www.graphapp.ai/engineering-glossary/git/object](https://www.graphapp.ai/engineering-glossary/git/object)  
16. www.graphapp.ai, accessed September 19, 2025, [https://www.graphapp.ai/engineering-glossary/git/git-object-types-blob-tree-commit-tag\#:\~:text=commit%2C%20tag)%3F-,Git%20object%20types%20(blob%2C%20tree%2C%20commit%2C%20tag),mark%20specific%20points%20in%20history.](https://www.graphapp.ai/engineering-glossary/git/git-object-types-blob-tree-commit-tag#:~:text=commit%2C%20tag\)%3F-,Git%20object%20types%20\(blob%2C%20tree%2C%20commit%2C%20tag\),mark%20specific%20points%20in%20history.)  
17. Git Under the Hood, Part 1: Object Storage in Git | by Amir Ebrahimi Fard | Data Management for Researchers | Medium, accessed September 19, 2025, [https://medium.com/data-management-for-researchers/git-under-the-hood-part-1-object-storage-in-git-57c9adfb5e5f](https://medium.com/data-management-for-researchers/git-under-the-hood-part-1-object-storage-in-git-57c9adfb5e5f)  
18. A Beginner's Guide to Git: A Comprehensive Cheatsheet of Common Commands \- Reddit, accessed September 19, 2025, [https://www.reddit.com/r/git/comments/zuq54x/a\_beginners\_guide\_to\_git\_a\_comprehensive/](https://www.reddit.com/r/git/comments/zuq54x/a_beginners_guide_to_git_a_comprehensive/)  
19. GIT Push and Pull Tutorial \- DataCamp, accessed September 19, 2025, [https://www.datacamp.com/tutorial/git-push-pull](https://www.datacamp.com/tutorial/git-push-pull)  
20. A Visual Git Reference \- Mark Lodato's blog, accessed September 19, 2025, [https://marklodato.github.io/visual-git-guide/](https://marklodato.github.io/visual-git-guide/)  
21. Basic Branching and Merging \- Git, accessed September 19, 2025, [https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging)  
22. Git Rebase vs. Merge: A Detailed Comparison with Examples, accessed September 19, 2025, [https://www.simplilearn.com/git-rebase-vs-merge-article](https://www.simplilearn.com/git-rebase-vs-merge-article)  
23. A basic Git workflow | Git tutorial \- Nulab, accessed September 19, 2025, [https://nulab.com/learn/software-development/git-tutorial/git-basics/what-is-git/basic-git-workflow/](https://nulab.com/learn/software-development/git-tutorial/git-basics/what-is-git/basic-git-workflow/)  
24. www.atlassian.com, accessed September 19, 2025, [https://www.atlassian.com/git/tutorials/merging-vs-rebasing\#:\~:text=Merging%20is%20a%20safe%20option,onto%20the%20tip%20of%20main%20.](https://www.atlassian.com/git/tutorials/merging-vs-rebasing#:~:text=Merging%20is%20a%20safe%20option,onto%20the%20tip%20of%20main%20.)  
25. Common Git Errors, How to Fix, and 5 Ways to Avoid Them \- Komodor, accessed September 19, 2025, [https://komodor.com/learn/git-errors/](https://komodor.com/learn/git-errors/)  
26. Resolving a merge conflict using the command line \- GitHub Docs, accessed September 19, 2025, [https://docs.github.com/articles/resolving-a-merge-conflict-using-the-command-line](https://docs.github.com/articles/resolving-a-merge-conflict-using-the-command-line)  
27. How to Resolve Merge Conflicts in Git? \- Simplilearn.com, accessed September 19, 2025, [https://www.simplilearn.com/tutorials/git-tutorial/merge-conflicts-in-git](https://www.simplilearn.com/tutorials/git-tutorial/merge-conflicts-in-git)  
28. Git Workflows for Teams: From Basics to Advanced Strategies | by Samuel Odekunle, accessed September 19, 2025, [https://samuelodekunle.medium.com/git-workflows-for-teams-from-basics-to-advanced-strategies-8258e2ceda9b](https://samuelodekunle.medium.com/git-workflows-for-teams-from-basics-to-advanced-strategies-8258e2ceda9b)  
29. GitHub Flow vs. Git Flow: A Workflow Comparison | AddWeb Digital, accessed September 19, 2025, [https://medium.com/@saurabh-dhariwal/workflows-comparison-github-flow-vs-git-flow-3cd811f3d0ae](https://medium.com/@saurabh-dhariwal/workflows-comparison-github-flow-vs-git-flow-3cd811f3d0ae)  
30. Gitflow Diagram Explained with Examples | EdrawMax Online, accessed September 19, 2025, [https://www.edrawmax.com/article/gitflow-diagram.html](https://www.edrawmax.com/article/gitflow-diagram.html)  
31. Git-flow vs GitHub-flow \- GitHub Gist, accessed September 19, 2025, [https://gist.github.com/Ocramius/bc5c76313ddfea340e3dcc31c991a682](https://gist.github.com/Ocramius/bc5c76313ddfea340e3dcc31c991a682)  
32. GitHub Best Practices | Webstandards, accessed September 19, 2025, [https://webstandards.ca.gov/2023/04/19/github-best-practices/](https://webstandards.ca.gov/2023/04/19/github-best-practices/)  
33. Common Git Problems and Their Fixes \- GeeksforGeeks, accessed September 19, 2025, [https://www.geeksforgeeks.org/git/common-git-problems-and-their-fixes/](https://www.geeksforgeeks.org/git/common-git-problems-and-their-fixes/)  
34. How can I revert back to a Git commit? \- Super User, accessed September 19, 2025, [https://superuser.com/questions/523963/how-can-i-revert-back-to-a-git-commit](https://superuser.com/questions/523963/how-can-i-revert-back-to-a-git-commit)  
35. A beginner's guide to GIT BISECT \- The process of elimination, accessed September 19, 2025, [https://www.metaltoad.com/blog/beginners-guide-git-bisect-process-elimination](https://www.metaltoad.com/blog/beginners-guide-git-bisect-process-elimination)  
36. Automating Git Bisect with Custom Scripts \- Acquia Developer Portal, accessed September 19, 2025, [https://dev.acquia.com/tutorial/automating-error-detection-git-bisect-run](https://dev.acquia.com/tutorial/automating-error-detection-git-bisect-run)  
37. dev.acquia.com, accessed September 19, 2025, [https://dev.acquia.com/tutorial/automating-error-detection-git-bisect-run\#:\~:text=Start%20Bisecting%3A%20On%20your%20local,test%20script%20on%20each%20one.](https://dev.acquia.com/tutorial/automating-error-detection-git-bisect-run#:~:text=Start%20Bisecting%3A%20On%20your%20local,test%20script%20on%20each%20one.)